import pandas as pd
import numpy as np

def read_csv_files(upload_folder):
    processed_train_df = pd.read_csv(f'{upload_folder}/processed_train.csv')
    processed_val_df = pd.read_csv(f'{upload_folder}/processed_val.csv')
    processed_test_df = pd.read_csv(f'{upload_folder}/processed_test.csv')
    processed_label = pd.read_csv(f'{upload_folder}/processed_combined_y.csv')
        
    combined_X = pd.concat([processed_train_df, processed_val_df, processed_test_df])
    combined_X.reset_index(drop=True, inplace=True)
    processed_label.reset_index(drop=True, inplace=True)
    combined_df = pd.concat([combined_X, processed_label], axis=1)

    return combined_df

def calculate_metrics(df):
    # Placeholder for your metrics calculation
    missing_values = df.isnull().sum().to_dict()
    missing_percentage = {col: (missing_values[col] / len(df) * 100) for col in df.columns}
    duplicate_rows = df.duplicated().sum()
    
    # Return a dictionary of calculated metrics
    return {
        'missing_values': missing_values,
        'missing_percentage': missing_percentage,
        'duplicate_rows': duplicate_rows,
        'num_rows': len(df)
    }

def data_comparison(upload_folder, original_file):
    # Read the datasets
    original_df = pd.read_csv(original_file)
    processed_df = read_csv_files(upload_folder)

    # Calculate metrics for both datasets
    metrics = {
        'before': calculate_metrics(original_df),
        'after': calculate_metrics(processed_df)
    }

    # Convert all numerical values to native Python types
    for key, value in metrics.items():
        if isinstance(value, dict):
            for sub_key, sub_value in value.items():
                if isinstance(sub_value, (np.integer, np.float)):
                    value[sub_key] = sub_value.item()  # Convert NumPy types to Python types
        elif isinstance(value, (np.integer, np.float)):
            metrics[key] = value.item()

    return metrics