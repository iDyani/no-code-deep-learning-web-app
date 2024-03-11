import React, { useEffect, useState } from 'react';

const TrainingProgressIndicator = ({ websocket }) => {
  const [progress, setProgress] = useState(0); // Track the training progress percentage
  const [statusMessage, setStatusMessage] = useState('Awaiting Training Start...'); // Initial status message

  useEffect(() => {
    if (websocket) {
        // Function to handle incoming training progress updates
        const handleTrainingProgress = (data) => {
            setProgress(data.progress); // Update progress state with data from the server
            updateStatusMessage(data.progress); // Update status message based on progress
        };

        // Register event listener for training progress
        websocket.on('trainingProgress', handleTrainingProgress);

        // Cleanup function to remove event listener on component unmount
        return () => {
            websocket.off('trainingProgress', handleTrainingProgress);
        };
    }
  }, [websocket]); // Effect runs on websocket change

  // Function to update status message based on progress
  const updateStatusMessage = (progress) => {
    if (progress < 25) {
      setStatusMessage('Training Started...'); // Initial phase of training
    } else if (progress < 50) {
      setStatusMessage('Making Progress...'); // Early training phase
    } else if (progress < 75) {
      setStatusMessage('More Than Halfway There...'); // Mid training phase
    } else if (progress < 100) {
      setStatusMessage('Almost Done...'); // Final phase of training
    } else {
      setStatusMessage('Training Complete!'); // Training completion
    }
  };

  // Function to determine progress bar color based on progress percentage
  const progressColor = progress => {
    if (progress < 50) return '#f44336'; // Red for less than 50%
    if (progress < 75) return '#ffeb3b'; // Yellow for 50% to 75%
    return '#4caf50'; // Green for 75% and above
  };

  return (
    <div>
      <h3>Training Progress</h3>
      <progress value={progress} max="100" style={{ width: '100%', backgroundColor: '#eee', color: progressColor(progress) }}></progress>
      <p style={{ color: progressColor(progress) }}>{progress.toFixed(0)}% Complete - {statusMessage}</p>
    </div>
  );
};

export default TrainingProgressIndicator;
