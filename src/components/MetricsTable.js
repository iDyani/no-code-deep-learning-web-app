import React from 'react';

// The MetricsTable component takes in a title and metrics as props
const MetricsTable = ({ title, metrics }) => {
    return (
        <div className="metrics-table-container">
            {/* Display the title of the metrics table */}
            <h3>{title}</h3>
            {/* Define the structure of the table */}
            <table className="metrics-table">
                {/* Table header specifying column names */}
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Missing Values</th>
                        <th>Percentage Missing</th>
                    </tr>
                </thead>
                {/* Table body to display the metrics data */}
                <tbody>
                    {/* Iterate over each entry in the missing_values object from metrics */}
                    {Object.entries(metrics.missing_values).map(([column, value]) => (
                        <tr key={column}>
                            <td>{column}</td>
                            <td>{value}</td>
                            {/* Display the percentage of missing values with two decimal points */}
                            <td>{metrics.missing_percentage[column].toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Additional statistics displayed below the table */}
            <ul className="data-stats">
              <li><strong>Number of Rows:</strong> {metrics.num_rows}</li>                            
              <li><strong>Duplicate Rows:</strong> {metrics.duplicate_rows}</li>
            </ul>
        </div>
    );
};

export default MetricsTable; // Export the component for use elsewhere in the application
