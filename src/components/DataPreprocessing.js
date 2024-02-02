import React, { useState, useEffect } from 'react';
import { sendOptionsToBackend, getComparisonSummaryData  } from './api';
import Collapsible from './Collapsible';
import MetricsTable from './MetricsTable'

const DataProcessingComponent = () => {
    const [options, setOptions] = useState({
        removeDuplicates: false,
        handleMissingValues: false,        
        encodeCategorical: false,
        normalization: false,
        standardization: false
    });
    const [comparisonData, setComparisonData] = useState({ before: null, after: null });

    const handleOptionChange = (e) => {
        const { name, value } = e.target;
        setOptions(prevOptions => ({
            ...prevOptions,
            [name]: value
        }));
    };

    useEffect(() => {
        // Fetch initial metrics data when the component mounts
        // fetchComparisonSummary();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        const isAnyOptionSelected = Object.values(options).some(value => value);
    
        if (!isAnyOptionSelected) {
            alert('No options selected. Proceeding to the next step.');
            return;
        }
    
        try {
            const response = await sendOptionsToBackend(options);
            const comparisonSummary = await getComparisonSummaryData();
            setComparisonData(comparisonSummary);
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
                            <li>Remove Duplicates: Eliminating duplicate rows helps prevent biased or skewed results by ensuring each data point is unique.</li>
                            <li>Handle Missing Values: Addressing missing data, either by filling or removing them. In this app, we are replacing missing values with column's mode.</li>
                            <li>Encode Categorical Variables: Converting categorical data into a numerical format makes it usable for machine learning models, as they require numerical input.</li>
                            <li>Normalization: Scaling numerical data to a standard range such as 0 to 1, is beneficial when features have varying scales and units.</li>
                            <li>Standardization: Transforming data to have a mean of zero and a standard deviation of one.</li>
                        </ul>

                    </div>                                   
            </Collapsible>
            <div className="options-box">
                <form className="data-processing-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        {/* Checkboxes for data cleaning options */}
                        <div className="form-section-title">Data Cleaning Options:</div>
                        <div className="form-option">
                            <input type="checkbox" name="removeDuplicates" onChange={handleOptionChange} />
                            <label>Remove Duplicates</label>
                        </div>
                        <div className="form-option">
                            <input type="checkbox" name="handleMissingValues" onChange={handleOptionChange} />
                            <label>Handle Missing Values</label>
                        </div>
                        {/* Add more options as needed */}
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