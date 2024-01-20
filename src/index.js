import React from 'react';
import ReactDOM from 'react-dom';
import './styles/App.css'; // Main stylesheet for the application
import App from './components/App'; // Root component of the application
import AppRoutes from './routes/Routes'; // Importing Routes

// Rendering the App component into the DOM
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
