import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os, json
from werkzeug.utils import secure_filename
import pandas as pd
# import numpy as np
# from tensorflow import keras
from db_config import MongoDBConfig
from database_utils import MongoDBUtils
from datetime import datetime
from label_column_selector import select_label_column
from sklearn.model_selection import train_test_split
from data_processing import process_data
from before_after import data_comparison

app = Flask(__name__, static_folder='../client/build', static_url_path='')
CORS(app)

UPLOAD_FOLDER = 'uploaded_files'
ORIGINAL_DATA_FOLDER = 'original_data'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json', 'txt'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ORIGINAL_DATA_FOLDER'] = ORIGINAL_DATA_FOLDER

for folder in [UPLOAD_FOLDER, ORIGINAL_DATA_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/data-summary', methods=['GET'])
def data_summary():
    try:
        original_file_path = get_original_uploaded_file_path()
        if not original_file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        df = pd.read_csv(original_file_path)
        summary = {
            'columns': df.columns.tolist(),
            'summary': {
                col: {
                    'data_type': convert_dtype(str(df[col].dtype)),
                    'missing_values': int(df[col].isnull().sum()),
                    'percent_missing': float((df[col].isnull().sum() / len(df)) * 100)
                } for col in df.columns
            },
            'row_count': len(df),
            'duplicate_count': int(df.duplicated().sum())
        }
        
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/visualization-data', methods=['GET'])
def visualization_data():
    try:
        column_name = request.args.get('columnName')

        # Fetch the latest uploaded file
        latest_file_path = get_original_uploaded_file_path()
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
        # Filter out only relevant data files (e.g., CSV files)
        data_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.endswith('.csv') and os.path.isfile(os.path.join(app.config['UPLOAD_FOLDER'], f))]
        
        if not data_files:
            return None

        # Get the latest file based on modification time
        latest_file = max(data_files, key=lambda x: os.path.getmtime(os.path.join(app.config['UPLOAD_FOLDER'], x)))
        return os.path.join(app.config['UPLOAD_FOLDER'], latest_file)
    except Exception as e:
        print(f"Error getting latest uploaded file: {e}")
        return None
    
def get_original_uploaded_file_path():
    try:
        # Fetch files from the original data folder
        data_files = [f for f in os.listdir(app.config['ORIGINAL_DATA_FOLDER']) if f.endswith('.csv') and os.path.isfile(os.path.join(app.config['ORIGINAL_DATA_FOLDER'], f))]
        
        if not data_files:
            return None

        latest_file = max(data_files, key=lambda x: os.path.getmtime(os.path.join(app.config['ORIGINAL_DATA_FOLDER'], x)))
        return os.path.join(app.config['ORIGINAL_DATA_FOLDER'], latest_file)
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
        file_path = os.path.join(app.config['ORIGINAL_DATA_FOLDER'], new_filename)

        file.save(file_path)
        return jsonify({'message': 'File uploaded successfully'}), 200

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/columns', methods=['GET'])
def get_columns():
    try:
        file_path = get_original_uploaded_file_path()
        if not file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        df = pd.read_csv(file_path)
        return jsonify(df.columns.tolist())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize and connect to MongoDB
db_config = MongoDBConfig()
db_config.connect()

# Use MongoDBUtils for database operations
db_utils = MongoDBUtils(db_config.db)

@app.route('/api/drop-columns', methods=['POST'])
def drop_columns():
    try:
        data = request.get_json()
        columns_to_drop = data['columns']

        # Load the dataset
        dataset_path = get_original_uploaded_file_path()
        if not os.path.exists(dataset_path):
            return jsonify({"error": "Dataset file not found"}), 404

        df = pd.read_csv(dataset_path)

        # Drop the specified columns
        df.drop(columns=columns_to_drop, inplace=True, errors='ignore')

        # Save the updated dataset
        df.to_csv(os.path.join(ORIGINAL_DATA_FOLDER, 'post_column_drop_data.csv'), index=False)

        return jsonify({"message": "Columns dropped successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

@app.route('/api/select-label-column', methods=['POST'])
def select_label():
    data = request.json
    file_path = get_original_uploaded_file_path()
    label_column = data.get('labelColumn')

    if not label_column:
        return jsonify({'error': 'Label column name is required'}), 400

    result, status_code = select_label_column(ORIGINAL_DATA_FOLDER, file_path, label_column)
    return jsonify(result), status_code

@app.route('/api/split-data', methods=['POST'])
def split_data():
    try:
        data = request.json
        train_size = float(data.get('trainSize', 0.6))
        validation_size = float(data.get('validationSize', 0.2))

        # Validation to ensure the sum of train_size and validation_size does not exceed 1
        if train_size + validation_size > 1.0:
            return jsonify({'error': 'Sum of training size and validation size should not exceed 1'}), 400

        original_file_path = get_original_uploaded_file_path()
        if not original_file_path:
            return jsonify({'error': 'No data file uploaded'}), 404

        original_df = pd.read_csv(original_file_path)
        test_size = float(max(0, 1 - train_size - validation_size))

        # Splitting logic
        train_df, test_df = train_test_split(original_df, test_size=test_size, random_state=42)
        val_size_adjusted = validation_size / (train_size + validation_size)
        train_df, val_df = train_test_split(train_df, test_size=val_size_adjusted, random_state=42)

        train_df.to_csv(os.path.join(UPLOAD_FOLDER, 'train.csv'), index=False)
        val_df.to_csv(os.path.join(UPLOAD_FOLDER, 'val.csv'), index=False)
        test_df.to_csv(os.path.join(UPLOAD_FOLDER, 'test.csv'), index=False)

        return jsonify({
            'message': 'Data split successfully',
            'train_size': len(train_df),
            'validation_size': len(val_df),
            'test_size': len(test_df),
            'total_size': len(original_df)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/process_data', methods=['POST'])
def process_data_route():
    options = request.json

    # Check if options are empty
    if not any(options.values()):
        return jsonify({"message": "No processing required"}), 200

    # Existing processing logic
    process_data(UPLOAD_FOLDER, ORIGINAL_DATA_FOLDER, options)
    return jsonify({"message": "Data processed successfully"}), 200

@app.route('/api/data-comparison-summary', methods=['GET'])
def data_comparison_summary():
    try:
        original_file = get_original_uploaded_file_path()
        if not original_file:
            return jsonify({'error': 'Original file not found'}), 404

        metrics = data_comparison(UPLOAD_FOLDER, original_file)
        if not metrics:
            return jsonify({'error': 'Error calculating metrics'}), 500
                
        return jsonify({'before': metrics['before'], 'after': metrics['after']})    
    except Exception as e:
        print({'error': 'Exception occurred: ' + str(e)})
        return jsonify({'error': 'Exception occurred: ' + str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])  # Create upload folder if it doesn't exist
    app.run(debug=True)


