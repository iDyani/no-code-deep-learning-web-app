const API_BASE_URL = 'http://127.0.0.1:5000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }
    return response.json();
};

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

export const getVisualizationData = async (columnName) => {
    const response = await fetch(`${API_BASE_URL}/visualization-data?columnName=${columnName}`, {
        method: 'GET'
    });
    return handleResponse(response);
};

export const getColumns = async () => {
    const response = await fetch(`${API_BASE_URL}/columns`, {
        method: 'GET'
    });
    return handleResponse(response);
};

export const getSummaryData = async () => {
    const response = await fetch(`${API_BASE_URL}/data-summary`);

    if (!response.ok) {
        throw new Error('Error fetching data summary');
    }
    return response.json();
};

