import React from 'react';

const MetricsTable = ({ title, metrics }) => {
    return (
        <div className="metrics-table-container">
            <h3>{title}</h3>
            <table className="metrics-table">
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Missing Values</th>
                        <th>Percentage Missing</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(metrics.missing_values).map(([column, value]) => (
                        <tr key={column}>
                            <td>{column}</td>
                            <td>{value}</td>
                            <td>{metrics.missing_percentage[column].toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ul className="data-stats">
              <li><strong>Number of Rows:</strong> {metrics.num_rows}</li>                            
              <li><strong>Duplicate Rows:</strong> {metrics.duplicate_rows}</li>
            </ul>
        </div>
    );
};

export default MetricsTable;
