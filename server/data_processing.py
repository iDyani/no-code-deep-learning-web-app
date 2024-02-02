import pandas as pd
import os
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
import json
import torch.nn.functional as F
import torch

# Global variables to store imputer
mode_imputer = None

def read_csv_files(upload_folder):
    train_df = pd.read_csv(f'{upload_folder}/train.csv')
    val_df = pd.read_csv(f'{upload_folder}/val.csv')
    test_df = pd.read_csv(f'{upload_folder}/test.csv')
    return train_df, val_df, test_df

def drop_duplicates(options, upload_folder):
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
    global mode_imputer
        
    if options['handleMissingValues']:
        if fit_imputer:
            mode_imputer = SimpleImputer(strategy='most_frequent')
            mode_imputer.fit(df)

        if mode_imputer:
            df = pd.DataFrame(mode_imputer.transform(df), columns=df.columns)

    return df

def process_features(train_df, val_df, test_df, options, datatypes, label_column):
    # Combine datasets for consistent processing
    combined_df = pd.concat([train_df, val_df, test_df])

    # Process categorical and ordinal columns
    if options['encodeCategorical']:        
        for col in [column for column, data_type in datatypes.items() if data_type in ['object', 'category'] and column != label_column]:
            # Create a mapping from categories to integers
            unique_values = combined_df[col].unique()
            mapping = {k: v for v, k in enumerate(unique_values)}
            
            # Apply the mapping
            train_df[col] = train_df[col].map(mapping)
            val_df[col] = val_df[col].map(mapping)
            test_df[col] = test_df[col].map(mapping)
    
    # Initialize scaler to None
    scaler = None

    # Process numerical columns
    num_cols = [column for column, data_type in datatypes.items() if data_type in ['int64', 'float64'] and column != label_column]
    
    if options['featureScaling'] == 'standardization':
        scaler = StandardScaler()
    elif options['featureScaling'] == 'normalization':
        scaler = MinMaxScaler()
    
    if scaler:
        # Fit on training data
        train_df[num_cols] = scaler.fit_transform(train_df[num_cols])

        # Transform validation and test data
        val_df[num_cols] = scaler.transform(val_df[num_cols])
        test_df[num_cols] = scaler.transform(test_df[num_cols])

    return train_df, val_df, test_df

def process_label_column(y_train, y_val, y_test):
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

def process_data(upload_folder, original_data_folder, options):
    train_df, val_df, test_df = drop_duplicates(options, upload_folder)
    
    label_info_path = [f for f in os.listdir(original_data_folder) if f.endswith('_selected_columns.json')]
    latest_file = max(label_info_path, key=lambda x: os.path.getmtime(os.path.join(original_data_folder, x)))
    json_file = os.path.join(original_data_folder, latest_file)
    
    with open(json_file, 'r') as file:
        label_column = json.load(file)['label_column']

    datatype_path = [f for f in os.listdir(original_data_folder) if f.endswith('column_data_types.json')]
    json_datatype_file = max(datatype_path, key=lambda x: os.path.getmtime(os.path.join(original_data_folder, x)))
    datatype_file = os.path.join(original_data_folder, json_datatype_file)
    with open(datatype_file, 'r') as file:
        datatypes = json.load(file)      
    
    # Clean and process features
    train_df = clean_data(train_df, options, fit_imputer=True)    
    val_df = clean_data(val_df, options)    
    test_df = clean_data(test_df, options)

    # # Drop rows where the label column is NaN
    # train_df.dropna(subset=[label_column], inplace=True)
    # val_df.dropna(subset=[label_column], inplace=True)
    # test_df.dropna(subset=[label_column], inplace=True)  

    # Separate label columns
    y_train = train_df.pop(label_column)
    y_val = val_df.pop(label_column)
    y_test = test_df.pop(label_column)

    train_df, val_df, test_df = process_features(train_df, val_df, test_df, options, datatypes, label_column)

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



