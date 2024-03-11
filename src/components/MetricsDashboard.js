import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MetricsDashboard = ({ websocket }) => {
  const [metricsData, setMetricsData] = useState([]); // State to store metrics data for charting

  useEffect(() => {
    // Function to handle incoming metric updates
    const handleUpdateMetrics = (data) => {
      // Transform metrics to percentages and round to 2 decimal places
      const newData = {
        epoch: data.epoch, // Current epoch number
        accuracy: (data.metrics.accuracy * 100).toFixed(2), // Accuracy in percentage
        precision: (data.metrics.precision * 100).toFixed(2), // Precision in percentage
        recall: (data.metrics.recall * 100).toFixed(2), // Recall in percentage
      };
      setMetricsData(currentData => [...currentData, newData]); // Update state with new data
    };

    if (websocket) {
      websocket.on('trainingProgress', handleUpdateMetrics); // Listen for trainingProgress events
    }

    // Cleanup function to remove the event listener
    return () => {
      if (websocket) {
        websocket.off('trainingProgress', handleUpdateMetrics); // Stop listening when the component unmounts
      }
    };
  }, [websocket]); // Effect runs on websocket change

  return (
    <div>
      <h3>Training Metrics</h3>
      <ResponsiveContainer width="95%" height={400}>
        <LineChart
          data={metricsData} // Chart data from state
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }} // Chart margins
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="epoch" /> // X-axis uses the epoch number
          <YAxis domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft' }} /> // Y-axis shows percentage
          <Tooltip /> // Tooltip for detailed metric display on hover
          <Legend /> // Legend for the chart
          <Line type="monotone" dataKey="accuracy" stroke="#8884d8" activeDot={{ r: 8 }} /> // Line for accuracy
          <Line type="monotone" dataKey="precision" stroke="#82ca9d" /> // Line for precision
          <Line type="monotone" dataKey="recall" stroke="#ffc658" /> // Line for recall
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsDashboard; // Export component for use in other parts of the application
