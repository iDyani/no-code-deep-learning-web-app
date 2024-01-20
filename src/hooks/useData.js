import { useState, useCallback } from 'react';
import { uploadData, startPreprocessing, fetchGPT3Insights } from './api';

const useData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [insights, setInsights] = useState(null);

    const uploadAndProcessData = async (file) => {
        try {
            setLoading(true);
            setError(null);

            // Upload data
            const uploadResponse = await uploadData(file);
            if (uploadResponse.message !== 'File uploaded successfully') {
                throw new Error(uploadResponse.message || 'Error in file upload');
            }

            // Start preprocessing
            const preprocessingResponse = await startPreprocessing(file.name);
            if (preprocessingResponse.message !== 'File preprocessed successfully') {
                throw new Error(preprocessingResponse.message || 'Error in data preprocessing');
            }

            // Assuming the response contains the preprocessed data
            setData(preprocessingResponse.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getInsights = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const insightsResponse = await fetchGPT3Insights('dataIdentifier'); // replace 'dataIdentifier' appropriately
            setInsights(insightsResponse.insights);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, insights, uploadAndProcessData, getInsights };
};

export default useData;
