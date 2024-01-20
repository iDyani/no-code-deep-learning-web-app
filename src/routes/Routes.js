// src/routes/Routes.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataUpload from '../components/DataUpload';
import DataVisualization from '../components/DataVisualization';
import DataSummary from '../components/DataSummary';
import App from '../components/App';

const AppRoutes = () => {
  return (
    <Router>
      <Routes> {/* Replace Switch with Routes */}
        <Route path="/" element={<App />} /> {/* Use element prop instead of component */}
        <Route path="/upload" element={<DataUpload />} />
        <Route path="/visualize" element={<DataVisualization />} />
        <Route path="/insights" element={<DataSummary />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
