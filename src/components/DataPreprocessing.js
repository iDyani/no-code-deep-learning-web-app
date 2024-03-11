import React, { useState, useEffect } from 'react';
import { sendOptionsToBackend, getComparisonSummaryData  } from './api'; // API calls to process data and get comparison summary
import Collapsible from './Collapsible'; // A custom collapsible component for showing/hiding content
import MetricsTable from './MetricsTable' // Component to display metrics in a table format

// DataProcessingComponent receives onDataProcessed as a prop from its parent to signal when data processing is complete.
const DataProcessingComponent = ({ onDataProcessed }) => {
    // State to manage selected options for data processing
    const [options, setOptions] = useState({
        removeDuplicates: false,
        handleMissingValues: false,        
        encodeCategorical: false,
        normalization: false,
        standardization: false
    });
    // State to store comparison data of the dataset before and after processing
    const [comparisonData, setComparisonData] = useState({ before: null, after: null });

    // Function to handle changes in options checkboxes/radio buttons
    const handleOptionChange = (e) => {
        const { name, checked } = e.target;
        // Update options state based on checkbox changes
        setOptions(prevOptions => ({
            ...prevOptions,
            [name]: checked
        }));
    };

    // Function to handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        const isAnyOptionSelected = Object.values(options).some(value => value);
    
        // Proceed without processing if no options are selected
        if (!isAnyOptionSelected) {
            alert('No options selected. Proceeding to the next step.');
            onDataProcessed();
            return;
        }
    
        try {
            // Send selected options to backend for processing
            const response = await sendOptionsToBackend(options);
            // Fetch and set the comparison summary data
            const comparisonSummary = await getComparisonSummaryData();
            setComparisonData(comparisonSummary);
            // Signal that data processing is complete
            onDataProcessed();
        } catch (error) {
            alert('Failed to process data');
        }
    };

    return (
        <div className="DataProcessing">
            <h2 className="data-processing-header">Data Cleaning and Feature Processing</h2>
            <Collapsible title="Understanding Data Cleaning" >
                    <div className="collapsible-content">
                        <p>
                            Data cleaning is vital for preparing your dataset for analysis and ensuring reliable model performance. Key cleaning actions include:
                        </p>
                        <ul>
                            <li><strong>Remove Duplicates</strong>: Eliminating duplicate rows helps prevent biased or skewed results by ensuring each data point is unique.</li>
                            <li><strong>Handle Missing Values</strong>: Addressing missing data, either by filling or removing them. In this app, we are replacing missing values with column's mode.</li>
                            <li><strong>Encode Categorical Variables</strong>: Converting categorical data into a numerical format makes it usable for machine learning models, as they require numerical input.</li>
                            <li><strong>Normalization</strong>: Scaling numerical data to a standard range such as 0 to 1, is beneficial when features have varying scales and units.</li>
                            <li><strong>Standardization</strong>: Transforming data to have a mean of zero and a standard deviation of one.</li>
                        </ul>

                    </div>                                   
            </Collapsible>
            <div className="options-box">
                <form className="data-processing-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-section-title">Data Cleaning Options:</div>
                        <div className="form-option">
                            <input type="checkbox" name="removeDuplicates" onChange={handleOptionChange} />
                            <label>Remove Duplicates</label>
                        </div>
                        <div className="form-option">
                            <input type="checkbox" name="handleMissingValues" onChange={handleOptionChange} />
                            <label>Handle Missing Values</label>
                        </div>
                    </div>
                    <div className="form-section">
                        {/* Checkboxes for feature processing options */}
                        <div className="form-section-title">Feature Processing Options:</div>
                        <div className="form-option">
                            <input type="checkbox" name="encodeCategorical" onChange={handleOptionChange} />
                            <label>Encode Categorical Variables</label>
                        </div>
                        <div className="form-option">
                            <input type="radio" name="featureScaling" value="normalization" onChange={handleOptionChange} />
                            <label>Normalization</label>
                        </div>
                        <div className="form-option">
                            <input type="radio" name="featureScaling" value="standardization" onChange={handleOptionChange} />
                            <label>Standardization</label>
                        </div>
                    </div>
                    <button type="submit" className="submit-button">Apply</button>
                </form>
            </div>
            <div className="comparison-section">
                {comparisonData.before && <MetricsTable title="Before Processing" metrics={comparisonData.before} />}
                {comparisonData.after && <MetricsTable title="After Processing" metrics={comparisonData.after} />}
            </div>
        </div>
    );
};

export default DataProcessingComponent;