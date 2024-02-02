import React, { useState } from 'react';
import DataUpload from './DataUpload';
import DataVisualization from './DataVisualization';
import DataSummary from './DataSummary';
import LabelColumnSelector from './LabelColumnSelector';
import DataSplitter from './DataSplitter';
import DataProcessingComponent from './DataPreprocessing.js';
import DropColumnsComponent from './DropColumnsComponent';
import '../styles/App.css';

function App() {
  const [dataUploaded, setDataUploaded] = useState(false);
  const [columnsDropped, setColumnsDropped] = useState(false);
  const [labelColumn, setLabelColumn] = useState('');

  const handleDataLabelSelected = (column) => {
      setLabelColumn(column);
  };

  const handleColumnsUpdated = () => {
    // Reset labelColumn to ensure the label column selector is displayed again
    setLabelColumn('');
    setColumnsDropped(true); // Indicate columns have been dropped/updated
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>No-Code Deep Learning Platform</h1>
      </header>
      <main>
        <DataUpload setDataUploaded={setDataUploaded} />
        <DataVisualization dataUploaded={dataUploaded} />
        <DataSummary dataUploaded={dataUploaded} />
        {dataUploaded && (
          <DropColumnsComponent onDataUpdated={handleColumnsUpdated} />
        )}
        {dataUploaded && columnsDropped && (
          <LabelColumnSelector onDataLabelSelected={handleDataLabelSelected} />
        )}
        {dataUploaded && labelColumn && <DataSplitter />}
        {dataUploaded && labelColumn && <DataProcessingComponent />}        
      </main>
      <footer>
        <p>© 2024 No-Code Deep Learning. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
