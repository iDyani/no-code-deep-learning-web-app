import warnings
warnings.filterwarnings("ignore", category=UserWarning)
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os, json
from werkzeug.utils import secure_filename
import pandas as pd
from datetime import datetime
from label_column_selector import select_label_column
from sklearn.model_selection import train_test_split
from data_processing import process_data
from before_after import data_comparison
from flask_socketio import SocketIO, emit
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.metrics import precision_score, recall_score, accuracy_score, confusion_matrix


# Create a Flask application instance
app = Flask(__name__, static_folder='../client/build', static_url_path='')

# Set a secret key for the application
app.config['SECRET_KEY'] = 'secret!'

# Initialize Flask-SocketIO with CORS (Cross-Origin Resource Sharing) allowed for localhost:3000
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

# Set up CORS for the Flask app to allow requests from the specified origin
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Define the folders for uploading files, storing original data, and saving model configurations
UPLOAD_FOLDER = 'uploaded_files'
ORIGINAL_DATA_FOLDER = 'original_data'
MODEL_CONFIGS = 'model_configs'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json', 'txt'}

# Configure the application to use the defined folders
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ORIGINAL_DATA_FOLDER'] = ORIGINAL_DATA_FOLDER
app.config['MODEL_CONFIGS'] = MODEL_CONFIGS

# Create the folders if they do not exist
for folder in [UPLOAD_FOLDER, ORIGINAL_DATA_FOLDER, MODEL_CONFIGS]:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Define a function to check if a file's extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve the React application's build directory by catching all routes not explicitly defined
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/data-summary', methods=['GET'])
def data_summary():
    """Generate a summary of the uploaded data file including column details and overall statistics."""
    try:
        # Retrieve the path of the original uploaded file
        original_file_path = get_original_uploaded_file_path()
        # Return an error if no file was uploaded
        if not original_file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        # Read the dataset
        df = pd.read_csv(original_file_path)
        # Create a summary of the data
        summary = {
            'columns': df.columns.tolist(),
            'summary': {
                col: {
                    'data_type': convert_dtype(str(df[col].dtype)),  # Convert data types for readability
                    'missing_values': int(df[col].isnull().sum()),  # Count missing values
                    'percent_missing': float((df[col].isnull().sum() / len(df)) * 100)  # Calculate percentage of missing values
                } for col in df.columns
            },
            'row_count': len(df),  # Total number of rows
            'duplicate_count': int(df.duplicated().sum())  # Count duplicate rows
        }
        
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/visualization-data', methods=['GET'])
def visualization_data():
    """Provide data for visualizing the distribution of values in a specific column."""
    try:
        column_name = request.args.get('columnName')  # Get the column name from the query parameters

        original_file_path = get_original_uploaded_file_path()
        if not original_file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        df = pd.read_csv(original_file_path)

        if column_name not in df.columns:
            return jsonify({'error': 'Column not found'}), 404

        column_data = df[column_name].value_counts().to_dict()  # Aggregate data by value counts

        visualization_data = {
            'labels': list(column_data.keys()),  # Value labels
            'values': list(column_data.values())  # Corresponding counts
        }

        return jsonify(visualization_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def convert_dtype(python_dtype):
    """Convert Python data types to more generic types for JavaScript."""
    mapping = {
        'float64': 'number',
        'int64': 'number',
        'object': 'string',
        'bool': 'boolean',
        'datetime64[ns]': 'date'
    }
    return mapping.get(python_dtype, 'unknown')  # Use 'unknown' for data types not explicitly mapped

def get_latest_uploaded_file_path():
    """Retrieve the path of the most recently uploaded data file."""
    try:
        # List all CSV files in the upload directory
        data_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.endswith('.csv') and os.path.isfile(os.path.join(app.config['UPLOAD_FOLDER'], f))]
        
        # Return None if no data files are found
        if not data_files:
            return None

        # Identify the latest file based on the last modification time
        latest_file = max(data_files, key=lambda x: os.path.getmtime(os.path.join(app.config['UPLOAD_FOLDER'], x)))
        return os.path.join(app.config['UPLOAD_FOLDER'], latest_file)
    except Exception as e:
        print(f"Error getting latest uploaded file: {e}")
        return None
    
def get_original_uploaded_file_path():
    """Fetch the path of the originally uploaded file from a specific directory."""
    try:
        # List CSV files in the original data folder
        data_files = [f for f in os.listdir(app.config['ORIGINAL_DATA_FOLDER']) if f.endswith('.csv') and os.path.isfile(os.path.join(app.config['ORIGINAL_DATA_FOLDER'], f))]
        
        # Return None if no files are found
        if not data_files:
            return None

        # Determine the latest file based on modification time
        latest_file = max(data_files, key=lambda x: os.path.getmtime(os.path.join(app.config['ORIGINAL_DATA_FOLDER'], x)))
        return os.path.join(app.config['ORIGINAL_DATA_FOLDER'], latest_file)
    except Exception as e:
        print(f"Error getting original uploaded file: {e}")
        return None
    
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Endpoint for uploading data files."""
    # Check if the 'file' key is present in the request files
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    # Validate the file name
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Check if the file is allowed and process it
    if file and allowed_file(file.filename):
        # Create a unique filename using a timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename, file_extension = os.path.splitext(file.filename)
        new_filename = f"{filename}_{timestamp}{file_extension}"
        secure_filename(new_filename)  # Ensure the filename is secure
        file_path = os.path.join(app.config['ORIGINAL_DATA_FOLDER'], new_filename)

        file.save(file_path)  # Save the file to the designated folder
        return jsonify({'message': 'File uploaded successfully'}), 200

    # Return an error if the file type is not allowed
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/columns', methods=['GET'])
def get_columns():
    """Endpoint to retrieve column names from the original uploaded dataset."""
    try:
        # Get the path of the original uploaded data file
        file_path = get_original_uploaded_file_path()
        # If no file has been uploaded, return an error message
        if not file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        # Read the CSV file to a pandas DataFrame
        df = pd.read_csv(file_path)
        # Return the list of columns in the DataFrame
        return jsonify(df.columns.tolist())
    except Exception as e:
        # Return any errors that occur during the process
        return jsonify({'error': str(e)}), 500

@app.route('/api/columns_for_label', methods=['GET'])
def get_columns_for_label():
    """Endpoint to retrieve column names for selecting the label column in the dataset."""
    try:
        # Get the path of the latest uploaded data file
        file_path = get_latest_uploaded_file_path()
        # If no file has been uploaded, return an error message
        if not file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        # Read the CSV file to a pandas DataFrame
        df = pd.read_csv(file_path)
        # Return the list of columns in the DataFrame
        return jsonify(df.columns.tolist())
    except Exception as e:
        # Return any errors that occur during the process
        return jsonify({'error': str(e)}), 500

@app.route('/api/drop-columns', methods=['POST'])
def drop_columns():
    """Endpoint to drop specified columns from the dataset."""
    try:
        # Retrieve column names to be dropped from the request body
        data = request.get_json()
        columns_to_drop = data['columns']

        # Load the dataset from the original uploaded file path
        dataset_path = get_original_uploaded_file_path()
        # If the dataset file does not exist, return an error message
        if not os.path.exists(dataset_path):
            return jsonify({"error": "Dataset file not found"}), 404

        df = pd.read_csv(dataset_path)

        # Drop the specified columns from the DataFrame
        df.drop(columns=columns_to_drop, inplace=True, errors='ignore')

        # Save the updated dataset back to the upload folder with a new name
        df.to_csv(os.path.join(UPLOAD_FOLDER, 'post_column_drop_data.csv'), index=False)

        # Confirm successful column removal
        return jsonify({"message": "Columns dropped successfully"}), 200
    except Exception as e:
        # Return any errors that occur during the process
        return jsonify({"error": str(e)}), 500

@app.route('/api/latest-data', methods=['GET'])
def get_latest_data():
    """Endpoint to download the latest data file uploaded by the user."""
    try:
        # Get the path of the latest uploaded data file
        file_path = get_latest_uploaded_file_path()
        # Send the file back as an attachment to the client
        return send_file(file_path, as_attachment=True)
    except IndexError:
        # If no files are uploaded, return an error message
        return jsonify({'error': 'No files uploaded'}), 404
    except Exception as e:
        # Return any other errors that occur during the process
        return jsonify({'error': str(e)}), 500

@app.route('/api/select-label-column', methods=['POST'])
def select_label():
    """Endpoint to specify which column in the dataset should be used as the label for model training."""
    # Retrieve the label column name from the request body
    data = request.json
    file_path = get_latest_uploaded_file_path()
    label_column = data.get('labelColumn')

    # Validate that a label column name was provided in the request
    if not label_column:
        return jsonify({'error': 'Label column name is required'}), 400

    # Call the function to process label column selection and return the result
    result, status_code = select_label_column(UPLOAD_FOLDER, file_path, label_column)
    return jsonify(result), status_code

@app.route('/api/split-data', methods=['POST'])
def split_data():
    """Endpoint to split the uploaded dataset into training, validation, and test datasets."""
    try:
        # Retrieve split sizes from the request body
        data = request.json
        train_size = float(data.get('trainSize', 0.6))
        validation_size = float(data.get('validationSize', 0.2))

        # Validate that the sum of train_size and validation_size does not exceed 1
        if train_size + validation_size > 1.0:
            return jsonify({'error': 'Sum of training size and validation size should not exceed 1'}), 400

        # Get the path of the latest uploaded data file
        file_path = get_latest_uploaded_file_path()
        if not file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        # Load the dataset from the file
        original_df = pd.read_csv(file_path)
        # Calculate the size of the test dataset
        test_size = float(max(0, 1 - train_size - validation_size))

        # Split the dataset
        train_df, test_df = train_test_split(original_df, test_size=test_size, random_state=42)
        # Adjust the validation size relative to the remaining data after splitting off the test set
        val_size_adjusted = validation_size / (train_size + validation_size)
        train_df, val_df = train_test_split(train_df, test_size=val_size_adjusted, random_state=42)

        # Save the split datasets to their respective files
        train_df.to_csv(os.path.join(UPLOAD_FOLDER, 'train.csv'), index=False)
        val_df.to_csv(os.path.join(UPLOAD_FOLDER, 'val.csv'), index=False)
        test_df.to_csv(os.path.join(UPLOAD_FOLDER, 'test.csv'), index=False)

        # Return the sizes of each dataset split
        return jsonify({
            'message': 'Data split successfully',
            'train_size': len(train_df),
            'validation_size': len(val_df),
            'test_size': len(test_df),
            'total_size': len(original_df)
        })
    except Exception as e:
        # Return any errors that occur during the process
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/process_data', methods=['POST'])
def process_data_route():
    """Endpoint to apply preprocessing options to the uploaded dataset."""
    # Retrieve preprocessing options from the request body
    options = request.json

    # Check if no options are provided and return a message indicating no processing is required
    if not any(options.values()):
        return jsonify({"message": "No processing required"}), 200

    # Call the process_data function with the provided options
    process_data(UPLOAD_FOLDER, options)
    # Return a success message
    return jsonify({"message": "Data processed successfully"}), 200

@app.route('/api/data-comparison-summary', methods=['GET'])
def data_comparison_summary():
    """Endpoint to provide a comparison summary between the original and processed datasets."""
    try:
        # Get the path of the original uploaded file
        original_file = get_original_uploaded_file_path()
        if not original_file:
            # Return an error if the original file is not found
            return jsonify({'error': 'Original file not found'}), 404

        # Call the data_comparison function to generate comparison metrics
        metrics = data_comparison(UPLOAD_FOLDER, original_file)
        if not metrics:
            # Return an error if there is a problem calculating the metrics
            return jsonify({'error': 'Error calculating metrics'}), 500
                
        # Return the comparison metrics for the 'before' and 'after' states
        return jsonify({'before': metrics['before'], 'after': metrics['after']})    
    except Exception as e:
        # Log and return any exceptions that occur
        print({'error': 'Exception occurred: ' + str(e)})
        return jsonify({'error': 'Exception occurred: ' + str(e)}), 500

@app.route('/api/network-parameters', methods=['GET'])
def get_network_parameters():
    """Endpoint to fetch the network parameters for the neural network model."""
    try:
        # Attempt to load and return the network parameters from a JSON file
        with open(os.path.join(UPLOAD_FOLDER, 'network_parameters.json'), 'r') as file:
            data = json.load(file)
            return jsonify(data)
    except FileNotFoundError:
        # Return an error if the network_parameters file is not found
        return jsonify({'error': 'network_parameters file not found'}), 404

@app.route('/api/save-model-config', methods=['POST'])
def save_model_config():
    """Endpoint to save a new model configuration."""
    # Retrieve the model configuration from the request body
    data = request.get_json()
    config = data.get('config')

    # Validate the presence of the model configuration
    if not config:
        return jsonify({'error': 'Configuration is missing'}), 400
    
    try:
        # Save the model configuration to a JSON file named 'latest_model_config.json' within the MODEL_CONFIGS directory
        with open(os.path.join(app.config['MODEL_CONFIGS'], 'latest_model_config.json'), 'w') as f:
            json.dump(config, f)
        # Return a success message upon saving the configuration
        return jsonify({'message': 'Model configuration saved successfully'}), 200
    except Exception as e:
        # Log and return an error message if an exception occurs during the saving process
        print(f"Error saving model config: {e}")
        return jsonify({'error': 'Failed to save model configuration'}), 500

@app.route('/api/get-model-config', methods=['GET'])
def get_model_config():
    """Endpoint to fetch the latest saved model configuration."""
    # Construct the file path for the latest model configuration JSON file
    file_path = os.path.join(app.config['MODEL_CONFIGS'], 'latest_model_config.json')
    try:
        # Check if the file exists and return its content
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                config = json.load(file)
            return jsonify(config), 200
        else:
            # Return an error if the file does not exist
            return jsonify({'error': 'Model configuration not found'}), 404
    except Exception as e:
        # Return an error message if an exception occurs during the file reading process
        return jsonify({'error': f'Failed to retrieve model configuration: {e}'}), 500

def load_data():
    """Utility function to load the processed training, validation, and testing datasets."""
    # Load the processed datasets from CSV files
    train_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], 'processed_train.csv'))
    val_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], 'processed_val.csv'))
    test_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], 'processed_test.csv'))
    
    # Load the processed label data for each dataset
    processed_y_train = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], 'processed_y_train.csv'))
    processed_y_val = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], 'processed_y_val.csv'))
    processed_y_test = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], 'processed_y_test.csv'))
    
    # Convert pandas DataFrames to PyTorch tensors for model training
    X_train = torch.tensor(train_df.values, dtype=torch.float32)
    y_train = torch.tensor(processed_y_train.values, dtype=torch.float32).squeeze()
    X_val = torch.tensor(val_df.values, dtype=torch.float32)
    y_val = torch.tensor(processed_y_val.values, dtype=torch.float32).squeeze()
    X_test = torch.tensor(test_df.values, dtype=torch.float32)
    y_test = torch.tensor(processed_y_test.values, dtype=torch.float32).squeeze()

    # Return the tensors for training, validation, and testing
    return X_train, y_train, X_val, y_val, X_test, y_test

def getModelConfig():
    """Utility function to fetch the latest saved model configuration."""
    # Construct the file path for the latest model configuration JSON file
    file_path = os.path.join(app.config['MODEL_CONFIGS'], 'latest_model_config.json')
    try:
        # Check if the file exists and return its content
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                config = json.load(file)
            return config
        else:
            # Raise a FileNotFoundError if the configuration file is not found
            raise FileNotFoundError(f'Model configuration not found.')
    except Exception as e:
        # Raise an exception if an error occurs during the file reading process
        raise Exception(f'Failed to retrieve model configuration: {e}')

class NeuralNetwork(nn.Module):
    """
    Defines the structure of the Neural Network using PyTorch.
    """
    def __init__(self, model_config):
        """
        Initializes the neural network model based on the provided model configuration.
        
        :param model_config: A dictionary containing the configuration of the model such as input size,
                             layers, and their settings.
        """
        super(NeuralNetwork, self).__init__()
        layers = []  # List to store layers of the network
        input_size = model_config['input_size']  # Set initial input size

        # Iterate through each layer in the model configuration
        for layer in model_config['layers']:
            # If the layer type is 'dense', add a Linear layer followed by an activation function if specified
            if layer['type'] == 'dense':
                layers.append(nn.Linear(input_size, layer['settings']['nodes']))  # Add a linear layer
                if layer['settings']['activation'] == 'relu':
                    layers.append(nn.ReLU())  # Add ReLU activation function
                elif layer['settings']['activation'] == 'sigmoid' and layer == model_config['layers'][-1]:
                    # Add sigmoid activation only if it's the final layer for binary classification
                    layers.append(nn.Sigmoid())
                input_size = layer['settings']['nodes']  # Update the input size for the next layer
            
            # If the layer type is 'dropout', add a Dropout layer
            elif layer['type'] == 'dropout':
                layers.append(nn.Dropout(layer['settings']['rate']))

        self.model = nn.Sequential(*layers)  # Create the sequential model from the layers list
        
        # Set the loss function based on the output nodes
        output_nodes = model_config['layers'][-1]['settings']['nodes']
        self.loss_function = nn.BCELoss() if output_nodes == 1 else nn.CrossEntropyLoss()

    def forward(self, x):
        """
        Defines the forward pass of the model.
        
        :param x: Input tensor to the network.
        :return: Output tensor from the network.
        """
        return self.model(x)

def compile_model(model_config):
    """
    Compiles the neural network model with the specified optimizer.
    
    :param model_config: A dictionary containing the configuration of the model.
    :return: Compiled model and optimizer.
    """
    model = NeuralNetwork(model_config)  # Instantiate the model
    optimizer = optim.RMSprop(model.parameters())  # Use RMSprop optimizer
    return model, optimizer

def evaluate_model(model, data_loader, loss_function, calculate_confusion_matrix=False):
    """
    Evaluates the model on a dataset.
    
    :param model: The neural network model.
    :param data_loader: DataLoader for the dataset to evaluate.
    :param loss_function: The loss function used for evaluation.
    :param calculate_confusion_matrix: Boolean indicating whether to calculate the confusion matrix.
    :return: Dictionary of evaluation metrics.
    """
    model.eval()  # Set the model to evaluation mode
    total_loss = 0
    all_predictions = []
    all_targets = []

    with torch.no_grad():  # Disable gradient computation
        for X_batch, y_batch in data_loader:
            predictions = model(X_batch).round()  # Get model predictions
            y_batch_reshaped = y_batch.float().reshape(predictions.shape)
            loss = loss_function(predictions, y_batch_reshaped)  # Calculate loss
            total_loss += loss.item()
            predicted_labels = predictions.round()  # Round predictions to get binary output
            all_predictions.extend(predicted_labels.cpu().numpy())
            all_targets.extend(y_batch.cpu().numpy())

    # Calculate metrics
    metrics = {
        'loss': total_loss / len(data_loader),
        'accuracy': accuracy_score(all_targets, all_predictions),
        'precision': precision_score(all_targets, all_predictions, average='macro', zero_division=0),
        'recall': recall_score(all_targets, all_predictions, average='macro', zero_division=0),
    }

    if calculate_confusion_matrix:
        # Calculate and add confusion matrix to metrics
        try:
            metrics['confusion_matrix'] = confusion_matrix(all_targets, all_predictions).tolist()
        except Exception as e:
            print('Error', {'error': str(e)})

    return metrics

def train_model(socketio, model, optimizer, epochs, X_train, y_train, X_val, y_val, X_test, y_test, loss_function):
    """
    Trains the neural network model.
    
    Parameters:
    - socketio: SocketIO server instance to emit training progress to the client.
    - model: The neural network model to be trained.
    - optimizer: The optimizer used for training.
    - epochs: The number of epochs to train for.
    - X_train, y_train: Training dataset features and labels.
    - X_val, y_val: Validation dataset features and labels.
    - X_test, y_test: Test dataset features and labels.
    - loss_function: The loss function to use during training.
    """
    # Create TensorDatasets for training, validation, and testing
    train_dataset = TensorDataset(torch.tensor(X_train, dtype=torch.float), torch.tensor(y_train, dtype=torch.long))
    val_dataset = TensorDataset(torch.tensor(X_val, dtype=torch.float), torch.tensor(y_val, dtype=torch.long))
    test_dataset = TensorDataset(torch.tensor(X_test, dtype=torch.float), torch.tensor(y_test, dtype=torch.long))
    
    # Create DataLoader instances for each dataset
    train_loader = DataLoader(train_dataset, batch_size=10, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=10)
    
    # Optional learning rate scheduler for optimizer
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1)

    # Training loop
    for epoch in range(1, epochs+1):
        model.train()  # Set model to training mode
        total_loss = 0
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()  # Clear gradients
            predictions = model(X_batch)  # Forward pass
            y_batch_reshaped = y_batch.float().reshape(predictions.shape)  # Reshape labels to match predictions shape
            loss = loss_function(predictions, y_batch_reshaped)  # Compute loss
            loss.backward()  # Backpropagate errors
            optimizer.step()  # Update weights
            total_loss += loss.item()
        scheduler.step()  # Update learning rate

        # Evaluate model on validation set
        val_metrics = evaluate_model(model, val_loader, loss_function)

        # Emit training progress through SocketIO
        progress = (epoch + 1) / (epochs + 1) * 100  # Calculate training progress percentage
        socketio.emit('trainingProgress', {
            'epoch': epoch,
            'progress': progress,
            'metrics': {
                'accuracy': val_metrics['accuracy'],
                'precision': val_metrics['precision'],
                'recall': val_metrics['recall']}  # Send validation metrics
        })
        print(f'Epoch {epoch}/{epochs} - Metrics: {val_metrics}')

    # Final evaluation on test set
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    test_metrics = evaluate_model(model, test_loader, loss_function, calculate_confusion_matrix=True)
    print("Test set validation:", test_metrics)
    socketio.emit('testMetrics', test_metrics)  # Emit final evaluation metrics

@socketio.on('startTraining')
def handle_start_training(json_data):
    """
    Handles the start training event from the client.
    
    Parameters:
    - json_data: Data received from the client, including epochs and model configuration.
    """
    epochs = json_data['epochs']
    model_config = getModelConfig()  # Retrieve model configuration
    X_train, y_train, X_val, y_val, X_test, y_test = load_data()  # Load dataset

    # Configure the model and loss function based on the final layer's activation function
    loss_function = nn.CrossEntropyLoss() if model_config['layers'][-1]['settings']['activation'] != 'sigmoid' else nn.BCELoss()

    if model_config['layers'][-1]['settings']['activation'] == 'sigmoid':
        y_train = torch.argmax(y_train, dim=1)
        y_val = torch.argmax(y_val, dim=1)
        y_test = torch.argmax(y_test, dim=1)
        model_config['layers'][-1]['settings']['nodes'] = 1
        loss_function = nn.BCELoss()

    model, optimizer = compile_model(model_config)  # Compile model
    print("Model:", model)
    try:
        train_model(socketio, model, optimizer, epochs, X_train, y_train, X_val, y_val, X_test, y_test, loss_function)
    except Exception as e:
        emit('trainingError', {'error': str(e)})  # Emit training error if any

if __name__ == '__main__':
    # Ensure upload folder exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    socketio.run(app, debug=True)  # Start the Flask-SocketIO server
