import React, { useState, useEffect } from 'react';
import { ModelConfigProvider } from './ModelConfigContext';
import DataUpload from './DataUpload';
import DataVisualization from './DataVisualization';
import DataSummary from './DataSummary';
import LabelColumnSelector from './LabelColumnSelector';
import DataSplitter from './DataSplitter';
import DataProcessingComponent from './DataPreprocessing.js';
import DropColumnsComponent from './DropColumnsComponent';
import ModelBuilder from './ModelBuilder';
import ModelTrainingComponent from './ModelTrainingComponent'
import { saveModelConfig, getModelConfig } from './api';
import '../styles/App.css';

function App() {
  // State hooks for tracking various states and actions within the application.
  const [dataUploaded, setDataUploaded] = useState(false);
  const [columnsDropped, setColumnsDropped] = useState(false);
  const [labelColumn, setLabelColumn] = useState('');
  const [modelConfig, setModelConfig] = useState(null);
  const [dataProcessed, setDataProcessed] = useState(false);
  const [shouldFetchModelConfig, setShouldFetchModelConfig] = useState(false);
  const [isModelTrainingVisible, setIsModelTrainingVisible] = useState(false);

  // Effect hook to fetch the model configuration when `shouldFetchModelConfig` state changes.
  useEffect(() => {
    if (shouldFetchModelConfig) {
      const fetchModelConfig = async () => {
        // Async function to retrieve the model configuration and handle potential errors.
        try {
          const config = await getModelConfig();
          console.log('Fetched model config:', config);
          setModelConfig(config);
        } catch (error) {
          console.log('Model config could not be retrieved:', error);
        }
      };
  
      fetchModelConfig();
    }
  }, [shouldFetchModelConfig]);

  // Event handlers for various actions within the application.
  const handleDataLabelSelected = (column) => {
      setLabelColumn(column);
  };

  const handleColumnsUpdated = () => {
    setLabelColumn('');
    setColumnsDropped(true);
  };

  const handleDataProcessed = () => {
    setDataProcessed(true);
  };

  const handleSaveConfig = async (config) => {
    // Async function to save the model configuration and log the outcome.
    try {
      await saveModelConfig(config);
      console.log('Model config saved successfully');
    } catch (error) {
      console.log('Failed to save model config:', error);
    }
  };

  const onModelBuild = () => {
    setIsModelTrainingVisible(true);
  };

// Render the application UI with conditional rendering based on the application state.
  return (
    <ModelConfigProvider>
      <div className="App">
        <header className="App-header">
          <h1>No-Code Deep Learning Platform</h1>
        </header>
        <main>
          <DataUpload setDataUploaded={setDataUploaded} />
          <DataVisualization dataUploaded={dataUploaded} />
          <DataSummary dataUploaded={dataUploaded} />
          {dataUploaded && <DropColumnsComponent onDataUpdated={handleColumnsUpdated} />}
          {dataUploaded && columnsDropped && <LabelColumnSelector onDataLabelSelected={handleDataLabelSelected} />}
          {dataUploaded && labelColumn && <DataSplitter />}
          {dataUploaded && labelColumn && <DataProcessingComponent onDataProcessed={handleDataProcessed} />}
          {dataUploaded && labelColumn && dataProcessed && <ModelBuilder onSave={handleSaveConfig} onModelBuilt={onModelBuild} />}
          {isModelTrainingVisible && <ModelTrainingComponent />}
        </main>
        <footer>
          <p>© 2024 No-Code Deep Learning. All rights reserved.</p>
        </footer>
      </div>
    </ModelConfigProvider>
  );
}

export default App;
