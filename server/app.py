from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import pandas as pd
from tensorflow import keras
from db_config import MongoDBConfig
from database_utils import MongoDBUtils
from datetime import datetime

app = Flask(__name__, static_folder='../client/build', static_url_path='')
CORS(app)

UPLOAD_FOLDER = 'uploaded_files'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json', 'txt'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/data-summary', methods=['GET'])
def data_summary():
    try:
        latest_file_path = get_latest_uploaded_file_path()
        if not latest_file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        df = pd.read_csv(latest_file_path)
        summary = {
            'columns': df.columns.tolist(),
            'summary': {col: {
                'data_type': convert_dtype(str(df[col].dtype)),
                'missing_values': int(df[col].isnull().sum()),
                'percent_missing': float((df[col].isnull().sum() / len(df)) * 100)
            } for col in df.columns},
            'row_count': len(df)
        }

        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/visualization-data', methods=['GET'])
def visualization_data():
    print("Visualization request received.")
    try:
        column_name = request.args.get('columnName')

        # Fetch the latest uploaded file
        latest_file_path = get_latest_uploaded_file_path()
        if not latest_file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        df = pd.read_csv(latest_file_path)

        # Check if the column exists
        if column_name not in df.columns:
            return jsonify({'error': 'Column not found'}), 404

        # Extract data for the specified column
        column_data = df[column_name].value_counts().to_dict()

        # Format data for visualization
        visualization_data = {
            'labels': list(column_data.keys()),
            'values': list(column_data.values())
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
        'datetime64[ns]': 'date',
        # Add more mappings as needed
    }
    return mapping.get(python_dtype, 'unknown')  # Return 'unknown' for unmapped types

def get_latest_uploaded_file_path():
    try:
        files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if os.path.isfile(os.path.join(app.config['UPLOAD_FOLDER'], f))]
        if not files:
            return None
        latest_file = max(files, key=lambda x: os.path.getmtime(os.path.join(app.config['UPLOAD_FOLDER'], x)))
        return os.path.join(app.config['UPLOAD_FOLDER'], latest_file)
    except Exception as e:
        print(f"Error getting latest uploaded file: {e}")
        return None

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        # Append a timestamp to the filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename, file_extension = os.path.splitext(file.filename)
        new_filename = f"{filename}_{timestamp}{file_extension}"
        secure_filename(new_filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)

        file.save(file_path)
        return jsonify({'message': 'File uploaded successfully'}), 200

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/columns', methods=['GET'])
def get_columns():
    try:
        file_path = get_latest_uploaded_file_path()
        if not file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        df = pd.read_csv(file_path)
        return jsonify(df.columns.tolist())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

MODEL_FOLDER = 'trained_models'
if not os.path.exists(MODEL_FOLDER):
    os.makedirs(MODEL_FOLDER)

def train_model(data_path, model_params):
    try:
        # Load the dataset
        df = pd.read_csv(data_path)
        target_column = model_params.get('target_column', 'label')  # Default label column
        features = df.drop(target_column, axis=1)
        labels = df[target_column]

        # Splitting data into training and testing (simple split for demonstration)
        train_features = features.sample(frac=0.8, random_state=42)
        test_features = features.drop(train_features.index)
        train_labels = labels.sample(frac=0.8, random_state=42)
        test_labels = labels.drop(train_labels.index)

        # Building a simple model for demonstration
        model = keras.Sequential([
            keras.layers.Dense(10, activation='relu', input_shape=(train_features.shape[1],)),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

        # Training the model
        model.fit(train_features, train_labels, epochs=10, batch_size=32)  # Example settings

        # Evaluate the model (optional)
        loss, accuracy = model.evaluate(test_features, test_labels)
        print(f"Model accuracy: {accuracy}")

        # Save the trained model
        model_save_path = os.path.join(MODEL_FOLDER, 'model.h5')
        model.save(model_save_path)

        return model_save_path, accuracy

    except Exception as e:
        raise RuntimeError(f"Error in model training: {str(e)}")

@app.route('/api/train', methods=['POST'])
def train():
    data = request.json
    filename = data.get('filename')
    model_params = data.get('model_params', {})  # Model parameters such as target column

    if not filename:
        return jsonify({'error': 'Filename is required'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    try:
        model_file, accuracy = train_model(file_path, model_params)
        return jsonify({'message': 'Model trained successfully', 'model_file': model_file, 'accuracy': accuracy})
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500

# Initialize and connect to MongoDB
db_config = MongoDBConfig()
db_config.connect()

# Use MongoDBUtils for database operations
db_utils = MongoDBUtils(db_config.db)

# Assuming you have routes that use db_utils for database operations

# Add logic to disconnect from MongoDB when the application shuts down
@app.teardown_appcontext
def shutdown_session(exception=None):
    db_config.disconnect()

@app.route('/api/latest-data', methods=['GET'])
def get_latest_data():
    try:
        file_path = get_latest_uploaded_file_path()
        return send_file(file_path, as_attachment=True)
    except IndexError:
        return jsonify({'error': 'No files uploaded'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
   
if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])  # Create upload folder if it doesn't exist
    app.run(debug=True)


