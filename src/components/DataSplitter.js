import React, { useState } from 'react';
import { splitData } from './api'; 
import Collapsible from './Collapsible';

function DataSplitter() {
    const [trainSize, setTrainSize] = useState(60);
    const [validationSize, setValidationSize] = useState(20);
    const [dataSizes, setDataSizes] = useState(null);
    const [error, setError] = useState('');

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

    const handleSplitData = async () => {
        if (validateInput()) {
            try {
                const response = await splitData(parseFloat(trainSize) / 100, parseFloat(validationSize) / 100);
                setDataSizes(response);
                setError('');
            } catch (err) {
                setError(err.message);
                setDataSizes(null);
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