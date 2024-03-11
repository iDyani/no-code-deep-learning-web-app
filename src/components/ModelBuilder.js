import React, { useContext, useState } from 'react';
import { ModelConfigContext } from './ModelConfigContext'; // Access global model configuration
import { saveModelConfig, fetchNetworkParameters } from './api'; // API calls
import LayerConfigurator from './LayerConfigurator'; // Component for configuring individual layers
import NetworkVisualization from './NetworkVisualization'; // Component for visualizing the network architecture
import Collapsible from './Collapsible'; // UI component for collapsible sections
import { Button, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material'; // MUI components for UI

// ModelBuilder component handles building and saving of the neural network model
const ModelBuilder = ({ onModelBuilt }) => {
  // Accessing and updating the global model configuration context
  const { modelConfig, setModelConfig } = useContext(ModelConfigContext);
  const [selectedLayerType, setSelectedLayerType] = useState(''); // State for selected layer type

  // Determining available layer types based on the last layer configuration
  const layerTypes = modelConfig.layers.length > 0 && modelConfig.layers[modelConfig.layers.length - 1].type === 'dense'
    ? ['dense', 'dropout'] : ['dense'];

  // Handles adding a new layer to the model configuration
  const handleAddLayer = () => {
    if (!selectedLayerType) return; // Guard clause if no layer type is selected
    const newLayer = { // Defining the new layer object
      id: Date.now().toString(),
      type: selectedLayerType,
      settings: { nodes: selectedLayerType !== 'dropout' ? 16 : undefined, rate: selectedLayerType === 'dropout' ? 0.5 : undefined, activation: selectedLayerType === 'dense' ? 'relu' : undefined },
    };
    setModelConfig({ ...modelConfig, layers: [...modelConfig.layers, newLayer] }); // Updating the global model configuration
    setSelectedLayerType(''); // Resetting the selected layer type state
  };

  // Handles removing a layer from the model configuration
  const handleRemoveLayer = (layerId) => {
    setModelConfig({ ...modelConfig, layers: modelConfig.layers.filter(layer => layer.id !== layerId) });
  };

  // Handles updating layer settings in the model configuration
  const handleUpdateLayer = (layerId, updatedLayer) => {
    const updatedLayers = modelConfig.layers.map(layer => layer.id === layerId ? { ...layer, settings: { ...layer.settings, ...updatedLayer.settings } } : layer);
    setModelConfig(prevConfig => ({ ...prevConfig, layers: updatedLayers }));
  };

  // Handles saving the model configuration to backend and updates output layer based on network parameters
  const handleSaveModel = async () => {
    const { num_label_classes, num_cols } = await fetchNetworkParameters(); // Fetching network parameters
    const outputLayer = { id: 'outputLayer', type: 'dense', settings: { nodes: num_label_classes, activation: num_label_classes > 2 ? 'softmax' : 'sigmoid' }, };
    const updatedModelConfig = { ...modelConfig, input_size: num_cols, layers: [...modelConfig.layers, outputLayer], };
    try {
      await saveModelConfig(updatedModelConfig); // Saving the updated model configuration
      console.log('Model saved successfully');
      onModelBuilt(); // Callback function to indicate model build completion
    } catch (error) {
      console.error('Failed to save model configuration:', error);
    }
  };

  return (
    <div className="model-builder-container">
        <h2>Configure Your Model</h2>
        <Collapsible title="Understanding the Model Building Process" >
            <div className="collapsible-content">
                <p>
                    Building a machine learning model involves several critical steps, each influencing the model's performance and accuracy. This process allows you to transform raw data into predictive insights. Here's a brief overview of the key components you might configure in this process:
                </p>
                <ul>
                    <li><strong>Model Type Selection:</strong> Start by selecting a model type suited for classification. This app specifically focuses on classification tasks with discrete labels.</li>

                    <li><strong>Layer Configuration:</strong> For neural network models, configuring the layers is crucial. Each layer type serves a different purpose—dense layers for general purposes, dropout layers to prevent overfitting. Adjusting the number and type of layers impacts the model's learning capacity.</li>
                    
                    <li><strong>Activation Functions:</strong> These functions help the model learn non-linear relationships. For classification tasks, 'relu' is commonly used in hidden layers for its efficiency, while the 'softmax' function is ideal for the output layer, turning logits into probabilities for each class.</li>

                    <li><strong>Optimizers and Learning Rate:</strong> The optimizer guides how the model updates its weights during training, with choices like SGD (Stochastic Gradient Descent) and Adam. The learning rate controls the step size of weight updates. Together, they influence the training speed and stability.</li>

                    <li><strong>Loss Functions:</strong> This determines how the model's predictions are compared to the actual labels. For classification, 'Cross-Entropy Loss' is typically used, encouraging the model to make accurate and confident predictions.</li>

                    <li><strong>Regularization Techniques:</strong> Options like L1 and L2 regularization add constraints on model weights to prevent overfitting, ensuring the model generalizes well to unseen data.</li>

                    <li><strong>Batch Size and Epochs:</strong> Batch size refers to the number of samples the model sees before updating its weights, while epochs refer to the number of times the entire dataset is passed through the model. These settings affect the training duration and model performance.</li>
                </ul>
            </div> 
        </Collapsible>
        <Grid container spacing={6} direction="column" style={{ marginTop: '20px' }}>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel id="layer-type-select-label">Layer Type</InputLabel>
            <Select
              labelId="layer-type-select-label"
              value={selectedLayerType}
              onChange={(e) => setSelectedLayerType(e.target.value)}
              displayEmpty>
              <MenuItem value=""><em>None</em></MenuItem>
              {layerTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleAddLayer} style={{ marginTop: '10px' }}>
            Add Layer
          </Button>
        </Grid>
        {modelConfig.layers.map(layer => (
          <Grid item key={layer.id}>
            <LayerConfigurator layer={layer} onRemove={handleRemoveLayer} onUpdate={handleUpdateLayer} />
          </Grid>
        ))}
        <Grid item>
          <NetworkVisualization modelConfig={modelConfig} />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleSaveModel}>
            Build Model
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default ModelBuilder;