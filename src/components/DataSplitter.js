// Import statements for React, API utility to perform data split, and a collapsible UI component
import React, { useState } from 'react';
import { splitData } from './api'; // API call for splitting data
import Collapsible from './Collapsible'; // Reusable collapsible component for displaying information

function DataSplitter() {
    // State hooks for controlling input values and displaying results or errors
    const [trainSize, setTrainSize] = useState(60); // Initial state for training data ratio
    const [validationSize, setValidationSize] = useState(20); // Initial state for validation data ratio
    const [dataSizes, setDataSizes] = useState(null); // To store response from API about dataset sizes
    const [error, setError] = useState(''); // For displaying error messages

    // Validates user input to ensure it is numeric and sums up to 100% or less
    const validateInput = () => {
        if (isNaN(parseFloat(trainSize) / 100) || isNaN(parseFloat(validationSize) / 100)) {
            setError('Input values must be numeric.');
            return false;
        }
        if ((parseFloat(trainSize) / 100 + parseFloat(validationSize) / 100) > 1) {
            setError('The sum of Training and Validation data ratios cannot exceed 100%.');
            return false;
        }
        return true;
    };

    // Handles the event when user clicks 'Split Data' button
    const handleSplitData = async () => {
        if (validateInput()) {
            try {
                // Calls the API with user-defined ratios and updates the state with the response
                const response = await splitData(parseFloat(trainSize) / 100, parseFloat(validationSize) / 100);
                setDataSizes(response); // Updates state with dataset sizes
                setError(''); // Clears any previous error messages
            } catch (err) {
                setError(err.message); // Sets error message if API call fails
                setDataSizes(null); // Resets dataset sizes
            }
        }            
    };

    return (
        <div className="data-splitter">
            <h2>Split Data</h2>
            <Collapsible title="What does data splitting do?">
                <div className="collapsible-content">
                    <p>
                        Splitting data into training, validation, and test sets is crucial for building effective machine learning models:
                        <ul>
                            <li>
                                Training Set (60-70%): Used for training the model. It's the main portion where the model learns patterns and behaviors.
                            </li>
                            <li>
                                Validation Set (10-20%): Helps in tuning the model and validating its performance during training. It's essential for preventing overfitting.
                            </li>
                            <li>
                                Test Set (20-30%): Evaluates the model's performance on unseen data, simulating real-world scenarios.
                            </li>
                        </ul>                        
                    </p>
                </div>
                
            </Collapsible>
            <div>
                <label htmlFor="train-size">Training Data Ratio (%):</label>
                <input
                    id="train-size"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={trainSize}
                    onChange={(e) => setTrainSize(parseFloat(e.target.value))}
                />
            </div>
            <div id='val_set'>
                <label htmlFor="validation-size">Validation Data Ratio (%):</label>
                <input
                    id="validation-size"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={validationSize}
                    onChange={(e) => setValidationSize(parseFloat(e.target.value))}
                />
            </div>
            <button onClick={handleSplitData}>Split Data</button>
            {dataSizes && (
                <table  className="summary-table">
                    <thead>
                        <tr>
                            <th>Dataset</th>
                            <th>Size (rows)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Training Set</td>
                            <td>{dataSizes.train_size}</td>
                        </tr>
                        <tr>
                            <td>Validation Set</td>
                            <td>{dataSizes.validation_size}</td>
                        </tr>
                        <tr>
                            <td>Test Set</td>
                            <td>{dataSizes.test_size}</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td>{dataSizes.total_size}</td>
                        </tr>
                    </tbody>
                </table>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default DataSplitter;