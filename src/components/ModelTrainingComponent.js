import React, { useState, useEffect } from 'react';
import { getModelConfig } from './api';
import TrainingProgressIndicator from './TrainingProgressIndicator';
import MetricsDashboard from './MetricsDashboard';
import ConfusionMatrix from './ConfusionMatrix';
import TestMetrics from './TestMetrics';
import io from 'socket.io-client';

const ModelTrainingComponent = () => {
    const [epochs, setEpochs] = useState(10);
    const [trainingStatus, setTrainingStatus] = useState({
        progress: 0,
        estimatedTime: '',
        metrics: {},
        isTraining: false,
        confusion_matrix: [],
        testMetrics: {}
    });
    
    const [socket, setSocket] = useState(null);

    const startTraining = async () => {
        setTrainingStatus(prevStatus => ({ ...prevStatus, isTraining: true }));
        const socketInstance = io('http://127.0.0.1:5000');

        socketInstance.on('connect', async () => {
            console.log('Socket Connected');
            try {
                const modelConfig = await getModelConfig();
                const trainingConfig = {
                    action: 'startTraining',
                    epochs,
                    optimizer: 'rmsprop',
                    metrics: ['accuracy'],
                    loss: modelConfig.layers[modelConfig.layers.length - 1].settings.nodes < 3 ? 'binary_crossentropy' : 'categorical_crossentropy',
                    inputSize: modelConfig.input_size,
                };
                socketInstance.emit('startTraining', trainingConfig);
            } catch (error) {
                console.error('Failed to fetch model configuration:', error);
                setTrainingStatus(prevStatus => ({ ...prevStatus, isTraining: false }));
            }
        });

        socketInstance.on('trainingProgress', (data) => {
            console.log("Emitted data:", data);
            setTrainingStatus(prevStatus => ({
                ...prevStatus,
                progress: data.progress,
                estimatedTime: data.estimatedTime,
                metrics: data.metrics,
            }));
        });

        socketInstance.on('trainingComplete', () => {
            setTrainingStatus({
                progress: 100,
                estimatedTime: '', 
                metrics: trainingStatus.metrics,
                isTraining: false,
            });
            socketInstance.close();
            setSocket(null); // Reset the socket state
        });

        socketInstance.on('testMetrics', (data) => {
            setTrainingStatus(prevStatus => ({
                ...prevStatus,
                confusion_matrix: data.confusion_matrix,
                testMetrics: {
                    accuracy: data.accuracy,
                    precision: data.precision,
                    recall: data.recall
                },
                isTraining: false
            }));
        });

        setSocket(socketInstance); // Update state to trigger re-render with the new socket instance
                
        // Cleanup on component unmount
        return () => {
            if (socket) socket.close();
        };
        
    };

    // Dynamically generate labels for the confusion matrix based on its size
    const confusionMatrixLabels = Array.from({ length: trainingStatus.confusion_matrix.length }, (_, i) => i);

    return (
        <div className="model-training-container">
            <h2>Model Training</h2>
            <label htmlFor="epochs">Epochs:</label>
            <input
                type="number"
                id="epochs"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
            />
            <button onClick={startTraining} disabled={trainingStatus.isTraining || !epochs}>
                {trainingStatus.isTraining ? 'Training...' : 'Train Model'}
            </button>
            {socket && <TrainingProgressIndicator websocket={socket} progress={trainingStatus.progress} estimatedTime={trainingStatus.estimatedTime} />}
            {socket && <MetricsDashboard websocket={socket} metrics={trainingStatus.metrics} />}
            {trainingStatus.confusion_matrix.length > 0 && (
                <ConfusionMatrix matrix={trainingStatus.confusion_matrix} labels={confusionMatrixLabels} />
            )}
            {Object.keys(trainingStatus.testMetrics).length > 0 && <TestMetrics metrics={trainingStatus.testMetrics} />}
        </div>
    );
};

export default ModelTrainingComponent;