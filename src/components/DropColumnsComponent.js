// DropColumnsComponent.js
import React, { useState, useEffect } from 'react';
import { getColumns, dropColumns } from './api';
import Collapsible from './Collapsible';

const DropColumnsComponent = ({ onDataUpdated }) => {
    const [availableColumns, setAvailableColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState(new Set());
    const [dropStatus, setDropStatus] = useState(null);
    const [isDropped, setIsDropped] = useState(false);

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const columns = await getColumns();
                setAvailableColumns(columns);
            } catch (error) {
                console.error('Error fetching columns:', error);
            }
        };
        fetchColumns();
    }, []);

    const handleCheckboxChange = (columnName) => {
        setSelectedColumns(prev => new Set(prev.has(columnName) ? [...prev].filter(col => col !== columnName) : [...prev, columnName]));
    };

    const handleSubmit = async () => {
        // Alert if all columns are selected or less than two columns remain unselected
        if (selectedColumns.size === availableColumns.length || availableColumns.length - selectedColumns.size < 2) {
            alert('At least one feature and one label column are necessary for the model to work.');
            return; // Exit the function to prevent further actions
        }
        try {
            await dropColumns([...selectedColumns]);
            setDropStatus(<>Columns: <b><i>{[...selectedColumns].join(', ')}</i></b> dropped successfully.</>);
            onDataUpdated(); // Notify parent component to update data
            setIsDropped(true);
        } catch (error) {
            setDropStatus('Failed to drop columns.');
        }
    };

    const handleSkip = () => {
        setDropStatus('No columns were dropped.');
        onDataUpdated(); // Proceed without dropping
    };

    return (
        <div className={`drop-columns-container ${isDropped ? 'disabled' : ''}`}>
            <h2>Drop Columns</h2>
            <Collapsible title="Why drop columns?">
                <div className="collapsible-content">
                <p>Dropping irrelevant columns can reduce the complexity of the model, improve its performance, and decrease the risk of overfitting. Choose the columns you believe are not contributing to the predictive power of the model. Remember to keep at least one feature and one label column for the model to function correctly.</p>
                <p>Note: Proceeding without dropping columns will use the dataset as is, which may include unnecessary or irrelevant features.</p>
                </div>
            </Collapsible>
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
            <button onClick={handleSubmit} className="submit-button">Drop Selected Columns</button>
            <button onClick={handleSkip} className="skip-button">Proceed without Dropping Columns</button>
            {dropStatus && <p className="drop-status-message">{dropStatus}</p>}
        </div>

    );
};

export default DropColumnsComponent;
