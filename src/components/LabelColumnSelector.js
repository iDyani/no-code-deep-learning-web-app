import React, { useState, useEffect } from 'react';
import { getColumnsForLabel, selectLabelColumn } from './api';
import Collapsible from './Collapsible';

function LabelColumnSelector({ onDataLabelSelected }) {
    const [columns, setColumns] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectionMessage, setSelectionMessage] = useState('');

    useEffect(() => {
        fetchColumns();
    }, []);

    const fetchColumns = async () => {
        try {
            setLoading(true);
            const cols = await getColumnsForLabel();
            setColumns(cols);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch columns');
            setLoading(false);
        }
    };

    const handleSelection = async () => {
        try {
            setLoading(true);
            await selectLabelColumn(selectedColumn);
            onDataLabelSelected(selectedColumn);
            setSelectionMessage(<>Selected label column: <b><i>{selectedColumn}</i></b>.</>);
            setLoading(false);
        } catch (err) {
            setError('Failed to select label column');
            setLoading(false);
        }
    };
    
    return (
        <div className="label-column-selector">
            <h2>Select Label Column</h2>
            <Collapsible title="Why select a label column?">
                <p className="collapsible-content">Selecting the label column is crucial as it defines the target variable for your model. This column contains the outcomes or predictions your model will learn to generate.</p>
            </Collapsible>
            {error && <p className="error">{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <select id='column_selector' aria-label="Select column"
                        value={selectedColumn} 
                        onChange={(e) => setSelectedColumn(e.target.value)}
                    >
                        <option value="">--Select a column--</option>
                        {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                    <button onClick={handleSelection}>Select</button>
                    {selectionMessage && <p className="message">{selectionMessage}</p>}
                </>
            )}
        </div>
    );
}

export default LabelColumnSelector;