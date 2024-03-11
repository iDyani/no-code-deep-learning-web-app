import json
import pandas as pd
import os

def select_label_column(upload_folder, file_path, label_column):
    """
    Selects the specified label column from the dataset.
    
    :param file_path: Path to the uploaded dataset file.
    :param label_column: Name of the column to be used as the label.
    :return: A JSON response indicating success or failure.
    """
    if not os.path.exists(file_path):
        return {'error': 'File not found'}, 404

    try:
        df = pd.read_csv(file_path)

        if label_column not in df.columns:
            return {'error': 'Label column not found'}, 404

        # Saving the label column selection for future use
        selected_columns = {'label_column': label_column}
        selected_columns_path = file_path.replace('.csv', '_selected_columns.json')
        with open(selected_columns_path, 'w') as file:
            json.dump(selected_columns, file)

        # Create a dictionary with column names and their data types
        data_types = {col: str(df[col].dtype) for col in df.columns}

        # Convert the dictionary to JSON and save it to a file
        with open(os.path.join(upload_folder, 'column_data_types.json'), 'w') as json_file:
            json.dump(data_types, json_file)

        return {'message': 'Label column selected successfully'}, 200

    except Exception as e:
        return {'error': str(e)}, 500