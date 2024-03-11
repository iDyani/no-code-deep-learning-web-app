import React, { useState, useEffect } from 'react';
import { getSummaryData } from './api'; // API call to get data summary

function DataSummary({ dataUploaded }) {
    const [summaryData, setSummaryData] = useState(null); // State for storing summary data
    const [isLoading, setIsLoading] = useState(false); // State to track loading status
    const [error, setError] = useState(''); // State for storing any errors

    useEffect(() => {
        if (!dataUploaded) {
            // Clear data and error states if no data is uploaded
            setSummaryData(null);
            setError('');
            return;
        }

        const fetchData = async () => {
            // Fetch data summary asynchronously
            setIsLoading(true);
            setError('');
            try {
                const data = await getSummaryData(); // API call to fetch summary data
                setSummaryData(data); // Set fetched data to state
            } catch (error) {
                console.error('Error fetching data summary:', error);
                setError('Error fetching data summary'); // Handle errors
            } finally {
                setIsLoading(false); // Ensure loading state is reset
            }
        };

        fetchData(); // Trigger data fetching
    }, [dataUploaded]); // Effect runs when `dataUploaded` changes

    const renderTableBody = () => {
        // Render table rows for each column summary in the data
        if (!summaryData || !summaryData.summary) return null; // Return null if no summary data

        return Object.entries(summaryData.summary).map(([column, details]) => (
            <tr key={column}>
                <td>{column}</td>
                <td>{details.data_type}</td>
                <td>{details.missing_values}</td>
                <td>{(details.percent_missing || 0).toFixed(2)}%</td>
            </tr>
        ));
    };

    return (
        <div className="DataSummary">
            <h2>Data Summary</h2>
            {!dataUploaded ? (
                // Prompt user to upload data if not already done
                <p>Please upload a data file to view the summary.</p>
            ) : isLoading ? (
                // Display loading message while fetching data
                <p>Loading data summary...</p>
            ) : error ? (
                // Show error message if error occurred during fetch
                <p>{error}</p>
            ) : (
                // Render data summary table and statistics if data is available
                <>
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th>Column Name</th>
                                <th>Data Type</th>
                                <th>Missing Values</th>
                                <th>Percentage Missing</th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                    {summaryData && (
                        <ul className="data-stats">
                            <li><strong>Number of Columns:</strong> {summaryData.columns.length}</li>
                            <li><strong>Number of Rows:</strong> {summaryData.row_count}</li>
                            <li><strong>Duplicate Rows:</strong> {summaryData.duplicate_count}</li>
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}

export default DataSummary;
