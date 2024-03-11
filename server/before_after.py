import pandas as pd
import numpy as np

def read_csv_files(upload_folder):
    """
    Reads processed training, validation, and test datasets and combines them with the label column.

    Parameters:
    - upload_folder: The folder where the processed CSV files are stored.

    Returns:
    - combined_df: A Pandas DataFrame containing all combined data and labels.
    """
    # Read the processed datasets from CSV files
    processed_train_df = pd.read_csv(f'{upload_folder}/processed_train.csv')
    processed_val_df = pd.read_csv(f'{upload_folder}/processed_val.csv')
    processed_test_df = pd.read_csv(f'{upload_folder}/processed_test.csv')
    processed_label = pd.read_csv(f'{upload_folder}/processed_combined_y.csv')
        
    # Combine datasets
    combined_X = pd.concat([processed_train_df, processed_val_df, processed_test_df])
    combined_X.reset_index(drop=True, inplace=True)
    processed_label.reset_index(drop=True, inplace=True)
    combined_df = pd.concat([combined_X, processed_label], axis=1)

    return combined_df

def calculate_metrics(df):
    """
    Calculates and returns basic metrics for a DataFrame, including missing values, missing percentage, and duplicates.

    Parameters:
    - df: Pandas DataFrame for which to calculate metrics.

    Returns:
    - Dictionary containing metrics: missing values, missing percentage, duplicate rows, and total number of rows.
    """
    # Calculate missing values and percentages, and count duplicates
    missing_values = df.isnull().sum().to_dict()
    missing_percentage = {col: (missing_values[col] / len(df) * 100) for col in df.columns}
    duplicate_rows = df.duplicated().sum()
    
    # Return metrics
    return {
        'missing_values': missing_values,
        'missing_percentage': missing_percentage,
        'duplicate_rows': duplicate_rows,
        'num_rows': len(df)
    }

def data_comparison(upload_folder, original_file):
    """
    Compares the original dataset with the processed dataset to evaluate the effect of preprocessing.

    Parameters:
    - upload_folder: Folder containing processed datasets.
    - original_file: Path to the original dataset file.

    Returns:
    - Metrics comparing the original dataset to the processed dataset.
    """
    # Read original and processed datasets
    original_df = pd.read_csv(original_file)
    processed_df = read_csv_files(upload_folder)

    # Calculate metrics for both original and processed datasets
    metrics = {
        'before': calculate_metrics(original_df),
        'after': calculate_metrics(processed_df)
    }

    # Ensure numerical values are in Python native types for JSON serialization
    for key, value in metrics.items():
        if isinstance(value, dict):
            for sub_key, sub_value in value.items():
                if isinstance(sub_value, (np.integer, np.float64)):
                    value[sub_key] = sub_value.item()  # Convert NumPy types to Python types
        elif isinstance(value, (np.integer, np.float64)):
            metrics[key] = value.item()

    return metrics
