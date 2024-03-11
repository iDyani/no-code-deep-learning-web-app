import pandas as pd
import os
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
import json
import torch.nn.functional as F
import torch
import numpy as np

# Global variable to store the imputer for handling missing values
mode_imputer = None

def read_csv_files(upload_folder):
    """
    Reads the training, validation, and testing data from CSV files.

    Parameters:
    - upload_folder: The directory where the CSV files are stored.

    Returns:
    - train_df: DataFrame containing the training data.
    - val_df: DataFrame containing the validation data.
    - test_df: DataFrame containing the testing data.
    """
    train_df = pd.read_csv(f'{upload_folder}/train.csv')
    val_df = pd.read_csv(f'{upload_folder}/val.csv')
    test_df = pd.read_csv(f'{upload_folder}/test.csv')
    return train_df, val_df, test_df

def drop_duplicates(options, upload_folder):
    """
    Optionally removes duplicates from the combined dataset.

    Parameters:
    - options: Dictionary of options indicating whether duplicates should be removed.
    - upload_folder: Directory where the CSV files are located.

    Returns:
    - DataFrames of train, validation, and test datasets with duplicates removed if specified.
    """
    train_df, val_df, test_df = read_csv_files(upload_folder)
    
    if options['removeDuplicates']:
        train_df['origin'] = 'train'
        val_df['origin'] = 'val'
        test_df['origin'] = 'test'
        combined_df = pd.concat([train_df, val_df, test_df])
        combined_df = combined_df.drop_duplicates(combined_df.columns.difference(['origin']))

        train_df_new = combined_df[combined_df['origin'] == 'train'].drop(columns='origin')
        val_df_new = combined_df[combined_df['origin'] == 'val'].drop(columns='origin')
        test_df_new = combined_df[combined_df['origin'] == 'test'].drop(columns='origin')
        return train_df_new, val_df_new, test_df_new
    else:
        return train_df, val_df, test_df

def clean_data(df, options, fit_imputer=False):
    """
    Cleans the given DataFrame based on the specified options, such as handling missing values.

    Parameters:
    - df: DataFrame to be cleaned.
    - options: Dictionary of processing options.
    - fit_imputer: Boolean indicating whether the imputer should be fitted.

    Returns:
    - The cleaned DataFrame.
    """
    global mode_imputer
        
    if options['handleMissingValues']:
        if fit_imputer:
            mode_imputer = SimpleImputer(strategy='most_frequent')
            mode_imputer.fit(df)

        if mode_imputer:
            df = pd.DataFrame(mode_imputer.transform(df), columns=df.columns)

    return df

def process_features(train_df, val_df, test_df, options, datatypes, label_column):
    """
    Processes features of the dataframes such as encoding categorical variables and feature scaling.

    Parameters:
    - train_df, val_df, test_df: DataFrames containing training, validation, and testing data.
    - options: Dictionary of processing options.
    - datatypes: Dictionary mapping column names to their data types.
    - label_column: The name of the label column which should not be encoded or scaled.

    Returns:
    - Processed training, validation, and testing DataFrames.
    """
    # Combine datasets for consistent processing
    combined_df = pd.concat([train_df, val_df, test_df])

    # Process categorical and ordinal columns
    if options['encodeCategorical']:        
        for col in [column for column, data_type in datatypes.items() if data_type in ['object', 'category'] and column != label_column]:
            unique_values = combined_df[col].unique()
            mapping = {k: v for v, k in enumerate(unique_values)}
            
            train_df[col] = train_df[col].map(mapping)
            val_df[col] = val_df[col].map(mapping)
            test_df[col] = test_df[col].map(mapping)
    
    scaler = None  # Initialize scaler to None

    # Identify numerical columns for scaling
    num_cols = [column for column, data_type in datatypes.items() if data_type in ['int64', 'float64'] and column != label_column]
    
    # Choose scaler based on options
    if options['featureScaling'] == 'standardization':
        scaler = StandardScaler()
    elif options['featureScaling'] == 'normalization':
        scaler = MinMaxScaler()
    
    if scaler:
        train_df = scaler.fit_transform(train_df)  # Fit and transform training data
        val_df = scaler.transform(val_df)  # Transform validation data
        test_df = scaler.transform(test_df)  # Transform test data

    return train_df, val_df, test_df

def one_hot_encoding(tensor, num_classes):
    """
    Creates a one-hot encoded matrix for a given tensor and number of classes.
    
    Parameters:
    - tensor: A PyTorch tensor representing labels.
    - num_classes: The total number of classes.
    
    Returns:
    - A one-hot encoded matrix as a NumPy array.
    """
    one_hot = np.zeros((tensor.size(0), num_classes), dtype=np.float64)
    one_hot[np.arange(tensor.size(0)), tensor.numpy()] = 1
    return one_hot

def process_label_column(y_train, y_val, y_test):
    """
    Encodes the label columns of training, validation, and test datasets into one-hot format.
    
    Parameters:
    - y_train, y_val, y_test: Label columns for training, validation, and test datasets.
    
    Returns:
    - Encoded label columns for training, validation, and test datasets.
    """
    # Combine the labels into a single series to ensure consistent encoding
    combined_labels = pd.concat([y_train, y_val, y_test], axis=0).reset_index(drop=True)
    
    # Determine the number of classes for label encoding
    num_classes = len(combined_labels.unique())
    unique_labels = set(combined_labels)

    # Create a mapping for categorical values
    mapping = {val: i for i, val in enumerate(unique_labels)}
    
    # Apply the mapping
    mapped_values = combined_labels.map(mapping)
    
    # Convert to PyTorch tensor
    tensor = torch.tensor(mapped_values.values, dtype=torch.int64)
    
    # Apply one-hot encoding
    encoded_labels = F.one_hot(tensor, num_classes=num_classes).numpy()
    
    # Split the encoded labels back into the original splits
    train_size = len(y_train)
    val_size = len(y_val)
    test_size = len(y_test)
    encoded_y_train = pd.DataFrame(encoded_labels[:train_size])
    encoded_y_val = pd.DataFrame(encoded_labels[train_size:train_size+val_size])
    encoded_y_test = pd.DataFrame(encoded_labels[-test_size:])
    
    return encoded_y_train, encoded_y_val, encoded_y_test

def process_data(upload_folder, options):
    """
    Main function to process data according to the specified options.
    
    Parameters:
    - upload_folder: Directory where the data files are stored.
    - options: Dictionary specifying processing options such as duplicate removal and missing value handling.
    
    The function performs operations like dropping duplicates, cleaning data (e.g., imputing missing values), and processing features. It also processes label columns and saves the processed data.
    """
    train_df, val_df, test_df = drop_duplicates(options, upload_folder)
    
    label_info_path = [f for f in os.listdir(upload_folder) if f.endswith('_selected_columns.json')]
    latest_file = max(label_info_path, key=lambda x: os.path.getmtime(os.path.join(upload_folder, x)))
    json_file = os.path.join(upload_folder, latest_file)
    
    with open(json_file, 'r') as file:
        label_column = json.load(file)['label_column']

    datatype_path = [f for f in os.listdir(upload_folder) if f.endswith('column_data_types.json')]
    json_datatype_file = max(datatype_path, key=lambda x: os.path.getmtime(os.path.join(upload_folder, x)))
    datatype_file = os.path.join(upload_folder, json_datatype_file)
    with open(datatype_file, 'r') as file:
        datatypes = json.load(file)      
    
    # Clean and process features
    train_df = clean_data(train_df, options, fit_imputer=True)    
    val_df = clean_data(val_df, options)    
    test_df = clean_data(test_df, options)

    # Separate label columns
    y_train = train_df.pop(label_column)
    y_val = val_df.pop(label_column)
    y_test = test_df.pop(label_column)

    train_df, val_df, test_df = process_features(train_df, val_df, test_df, options, datatypes, label_column)

    # store variables for neural network's input_size parameter and number of nodes for last layer
    combined_df = pd.concat([train_df, val_df, test_df])
    num_columns = len(combined_df.columns)

    combined_labels = pd.concat([y_train, y_val, y_test], axis=0).reset_index(drop=True)
    num_classes = len(combined_labels.unique())

    with open(os.path.join(upload_folder, 'network_parameters.json'), 'w') as json_file:
            json.dump({"num_cols": num_columns, "num_label_classes": num_classes}, json_file)

    # Process label columns
    processed_y_train, processed_y_val, processed_y_test = process_label_column(y_train, y_val, y_test)

    # Save processed data
    train_df.to_csv(f'{upload_folder}/processed_train.csv', index=False)
    val_df.to_csv(f'{upload_folder}/processed_val.csv', index=False)
    test_df.to_csv(f'{upload_folder}/processed_test.csv', index=False)
    processed_y_train.to_csv(f'{upload_folder}/processed_y_train.csv', index=False)
    processed_y_val.to_csv(f'{upload_folder}/processed_y_val.csv', index=False)
    processed_y_test.to_csv(f'{upload_folder}/processed_y_test.csv', index=False)
    pd.concat([y_train, y_val, y_test]).to_csv(f'{upload_folder}/processed_combined_y.csv', index=False)



