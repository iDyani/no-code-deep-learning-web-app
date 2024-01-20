import React, { useState } from 'react';
import DataUpload from './DataUpload';
import DataVisualization from './DataVisualization';
import DataSummary from './DataSummary';
import '../styles/App.css';

function App() {
  const [dataUploaded, setDataUploaded] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        <h1>No-Code Deep Learning Platform</h1>
      </header>
      <main>
        <DataUpload setDataUploaded={setDataUploaded} />
        <DataVisualization dataUploaded={dataUploaded} />
        <DataSummary dataUploaded={dataUploaded} />
      </main>
      <footer>
        <p>© 2024 No-Code Deep Learning. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
