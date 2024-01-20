import React, { useState, useEffect } from 'react';
import { getSummaryData } from './api';
import '../styles/App.css';

function DataSummary({ dataUploaded }) {
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!dataUploaded) {
            setSummaryData(null);
            setError('');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await getSummaryData();
                setSummaryData(data);
            } catch (error) {
                console.error('Error fetching data summary:', error);
                setError('Error fetching data summary');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dataUploaded]);

    const renderTableBody = () => {
        if (!summaryData || !summaryData.summary) return null;

        return Object.entries(summaryData.summary).map(([column, details]) => (
            <tr key={column}>
                <td>{column}</td>
                <td>
                    <select defaultValue={details.data_type || "unknown"}>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </td>
                <td>{details.missing_values}</td>
                <td>{(details.percent_missing || 0).toFixed(2)}%</td>
            </tr>
        ));
    };

    return (
        <div className="DataSummary">
            <h2>Data Summary</h2>
            {!dataUploaded ? (
                <p>Please upload a data file to view the summary.</p>
            ) : isLoading ? (
                <p>Loading data summary...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
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
                            <li><strong>Number of Rows:</strong> {summaryData.row_count}</li>
                            <li><strong>Number of Columns:</strong> {summaryData.columns.length}</li>
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}

export default DataSummary;
