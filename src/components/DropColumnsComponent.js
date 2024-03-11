import React, { useState, useEffect } from 'react';
import { getColumns, dropColumns } from './api'; // Importing API functions to fetch and drop columns
import Collapsible from './Collapsible'; // Reusable collapsible component for informative sections

const DropColumnsComponent = ({ onDataUpdated }) => {
    const [availableColumns, setAvailableColumns] = useState([]); // State to store columns fetched from API
    const [selectedColumns, setSelectedColumns] = useState(new Set()); // State to manage user-selected columns to drop
    const [dropStatus, setDropStatus] = useState(null); // State to inform user about the status of dropping columns
    const [isDropped, setIsDropped] = useState(false); // State to track if columns have been dropped

    useEffect(() => {
        // Fetch columns when the component mounts
        const fetchColumns = async () => {
            try {
                const columns = await getColumns(); // API call to fetch columns
                setAvailableColumns(columns); // Update state with fetched columns
            } catch (error) {
                console.error('Error fetching columns:', error); // Error handling
            }
        };
        fetchColumns();
    }, []); // Empty dependency array to run once on mount

    const handleCheckboxChange = (columnName) => {
        // Toggle selection status of a column
        setSelectedColumns(prev => new Set(prev.has(columnName) ? [...prev].filter(col => col !== columnName) : [...prev, columnName]));
    };

    const handleSubmit = async () => {
        // Prevent dropping all columns or leaving less than two
        if (selectedColumns.size === availableColumns.length || availableColumns.length - selectedColumns.size < 2) {
            alert('At least one feature and one label column are necessary for the model to work.');
            return;
        }
        try {
            await dropColumns([...selectedColumns]); // API call to drop selected columns
            setDropStatus(<>Columns: <b><i>{[...selectedColumns].join(', ')}</i></b> dropped successfully.</>); // Update status message
            onDataUpdated(); // Callback to notify parent component
            setIsDropped(true); // Indicate columns have been dropped
        } catch (error) {
            setDropStatus('Failed to drop columns.'); // Error handling
        }
    };

    const handleSkip = () => {
        // Handle skipping column drop
        setDropStatus('No columns were dropped.'); // Update status message
        onDataUpdated(); // Callback to notify parent component
    };

    return (
        <div className={`drop-columns-container ${isDropped ? 'disabled' : ''}`}>
            <h2>Drop Columns</h2>
            <Collapsible title="Why drop columns?">
                {/* Explanation on why dropping columns might be beneficial */}
                <div className="collapsible-content">
                <p>Dropping irrelevant columns can reduce the complexity of the model, improve its performance, and decrease the risk of overfitting. Choose the columns you believe are not contributing to the predictive power of the model. Remember to keep at least one feature and one label column for the model to function correctly.</p>
                <p>Note: Proceeding without dropping columns will use the dataset as is, which may include unnecessary or irrelevant features.</p>
                </div>
            </Collapsible>
            {/* Checkbox list for selecting columns to drop */}
            <div className="checkbox-list">
                {availableColumns.map(column => (
                <div key={column} className="checkbox-item">
                    <input 
                    type="checkbox" 
                    id={`checkbox-${column}`} 
                    className="custom-checkbox"
                    checked={selectedColumns.has(column)}
                    onChange={() => handleCheckboxChange(column)} 
                    />
                    <label htmlFor={`checkbox-${column}`} className="checkbox-label">{column}</label>
                </div>
                ))}
            </div>
            {/* Buttons to submit selection or skip dropping */}
            <button onClick={handleSubmit} className="submit-button">Drop Selected Columns</button>
            <button onClick={handleSkip} className="skip-button">Proceed without Dropping Columns</button>
            {/* Status message display */}
            {dropStatus && <p className="drop-status-message">{dropStatus}</p>}
        </div>
    );
};

export default DropColumnsComponent;
