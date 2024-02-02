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

export const getSummaryData = async () => {
    const response = await fetch(`${API_BASE_URL}/data-summary`);

    if (!response.ok) {
        throw new Error('Error fetching data summary');
    }
    return response.json();
};

export const getComparisonSummaryData = async () => {
    const response = await fetch(`${API_BASE_URL}/data-comparison-summary`);
    return handleResponse(response);
};

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

export const dropColumns = async (columns) => {
    const response = await fetch(`${API_BASE_URL}/drop-columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns })
    });
    return handleResponse(response);
};
