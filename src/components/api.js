// Base URL for the API
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Function to handle API response, checks if the response is ok, if not throws an error
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }
    return response.json();
};

// Uploads data by posting a file to the backend, reports progress if callback provided
export const uploadData = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (event) => {
            if (onProgress) {
                onProgress(event);
            }
        },
    });

    return handleResponse(response);
};

// Fetches visualization data for a given column name
export const getVisualizationData = async (columnName) => {
    const response = await fetch(`${API_BASE_URL}/visualization-data?columnName=${columnName}`, {
        method: 'GET'
    });
    return handleResponse(response);
};

// Retrieves column names for the uploaded data
export const getColumns = async () => {
    const response = await fetch(`${API_BASE_URL}/columns`, {
        method: 'GET'
    });
    return handleResponse(response);
};

// Fetches columns suitable for selection as label columns
export const getColumnsForLabel = async () => {
    const response = await fetch(`${API_BASE_URL}/columns_for_label`, {
        method: 'GET'
    });
    return handleResponse(response);
};

// Selects a specific column as the label column for model training
export const selectLabelColumn = async (columnName) => {
    const response = await fetch(`${API_BASE_URL}/select-label-column`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labelColumn: columnName })
    });
    return handleResponse(response);
};

// Retrieves summary data for uploaded dataset
export const getSummaryData = async () => {
    const response = await fetch(`${API_BASE_URL}/data-summary`);

    if (!response.ok) {
        throw new Error('Error fetching data summary');
    }
    return response.json();
};

// Fetches data comparison summary before and after processing
export const getComparisonSummaryData = async () => {
    const response = await fetch(`${API_BASE_URL}/data-comparison-summary`);
    return handleResponse(response);
};

// Splits data into training, validation, and test sets based on provided ratios
export const splitData = async (trainSize, validationSize) => {
    try {
        const response = await fetch(`${API_BASE_URL}/split-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trainSize, validationSize })
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error splitting data:', error);
        throw error;
    }
};

// Sends user-selected options for data processing to the backend
export const sendOptionsToBackend = async (options) => {
    try {
        const response = await fetch(`${API_BASE_URL}/process_data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending options to backend:', error);
        throw error;
    }
};

// Drops specified columns from the dataset
export const dropColumns = async (columns) => {
    const response = await fetch(`${API_BASE_URL}/drop-columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns })
    });
    return handleResponse(response);
};

// Saves the user-configured model to the backend
export const saveModelConfig = async (config) => {
    const response = await fetch(`${API_BASE_URL}/save-model-config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config })
    });
    return handleResponse(response);
};

// Fetches the saved model configuration from the backend
export const getModelConfig = async () => {
    const response = await fetch(`${API_BASE_URL}/get-model-config`);
    if (!response.ok) {
        throw new Error('Failed to fetch model configuration');
    }
    return await response.json();
};

// Fetches network parameters necessary for model configuration
export const fetchNetworkParameters = async () => {
    const response = await fetch(`${API_BASE_URL}/network-parameters`);
    if (!response.ok) {
        throw new Error('Network parameters could not be fetched');
    }
    return response.json();
};

