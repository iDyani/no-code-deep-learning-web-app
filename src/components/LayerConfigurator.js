import React, { useState } from 'react';
import { Button, Select, MenuItem, FormControl, InputLabel, TextField, Grid } from '@mui/material';

const LayerConfigurator = ({ layer, onRemove, onUpdate, isOutputLayer }) => {
  // States for layer configurations
  const [layerType, setLayerType] = useState(layer.type); // State to store the type of the layer
  const [nodesOrRate, setNodesOrRate] = useState(
    // State to store the number of nodes or dropout rate depending on layer type
    layer.type === 'dropout'
      ? layer.settings.rate !== undefined
        ? layer.settings.rate * 100 // Convert dropout rate to percentage
        : 50 // Default dropout rate if not specified
      : layer.settings.nodes || 32 // Default number of nodes if not specified
  );
  const [activation, setActivation] = useState(layer.settings.activation || 'relu'); // State for the activation function

  // Handler for changing layer type
  const handleTypeChange = (event) => {
    if(isOutputLayer) return; // Prevent type change for output layer
    const newType = event.target.value; // Get the new layer type from the event
    setLayerType(newType); // Update the layer type state
    if (newType === 'dropout') {
      // If the new layer type is dropout, set a default dropout rate and update the layer
      setNodesOrRate(50);
      onUpdate(layer.id, { type: newType, settings: { rate: 0.5 } });
    } else {
      // For other types, set default nodes and activation function then update the layer
      setNodesOrRate(32);
      setActivation('relu');
      onUpdate(layer.id, { type: newType, settings: { nodes: 32, activation: 'relu' } });
    }
  };

  // Handler for changing the number of nodes or dropout rate
  const handleNodesOrRateChange = (event) => {
    if(isOutputLayer) return; // Prevent changes for output layer
    const value = event.target.value; // Get the new value from the event
    setNodesOrRate(value); // Update the state
    if (layerType === 'dropout') {
      // Update the layer with the new dropout rate if layer type is dropout
      onUpdate(layer.id, { settings: { rate: parseFloat(value) / 100 } });
    } else {
      // Update the layer with the new number of nodes otherwise
      onUpdate(layer.id, { settings: { nodes: parseInt(value, 10) } });
    }
  };

  // Handler for changing activation function
  const handleActivationChange = (event) => {
    if (isOutputLayer) return; // Prevent changes for the output layer
    const updatedSettings = { ...layer.settings, activation: event.target.value }; // Update the layer's activation function
    onUpdate(layer.id, { settings: updatedSettings }); // Update the layer configuration
  };  

  return (
    <Grid container spacing={3} alignItems="center">
      {/* Render controls for layer type, nodes/dropout rate, and activation function */}
      {/* Prevent changes to the output layer to ensure it remains compatible with the model's output */}
      <Grid item xs={4}>
        <FormControl fullWidth disabled={isOutputLayer}>
          <InputLabel id={`layer-type-label-${layer.id}`}>Layer Type</InputLabel>
          <Select
            labelId={`layer-type-label-${layer.id}`}
            value={layerType}
            onChange={handleTypeChange}
            disabled={isOutputLayer} // Disable if it's the output layer
          >
            {/* Options for layer types */}
            <MenuItem value="dense">Dense</MenuItem>
            <MenuItem value="dropout">Dropout</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <TextField
          label={layerType === 'dropout' ? "Dropout Rate (%)" : "Number of Nodes"}
          type="number"
          value={nodesOrRate}
          onChange={handleNodesOrRateChange}
          InputLabelProps={{ shrink: true }}
          disabled={isOutputLayer} // Disable if it's the output layer
          inputProps={{
            step: layerType === 'dropout' ? 1 : undefined, // Allow smaller steps for dropout rate
            min: 0, // Minimum value
            max: layerType === 'dropout' ? 100 : undefined, // Maximum value for dropout rate
          }}
          fullWidth
        />
      </Grid>
      {layerType !== 'dropout' && (
        <Grid item xs={4}>
          <FormControl fullWidth disabled={isOutputLayer}>
            <InputLabel id={`activation-label-${layer.id}`}>Activation Function</InputLabel>
            <Select
              labelId={`activation-label-${layer.id}`}
              value={layer.settings.activation || 'relu'}
              onChange={handleActivationChange}
              disabled={isOutputLayer}
            >
              <MenuItem value="relu">ReLU</MenuItem>
              <MenuItem value="sigmoid">Sigmoid</MenuItem>
              <MenuItem value="tanh">Tanh</MenuItem>
              <MenuItem value="softmax">Softmax</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      <Grid item xs={12}>
        <Button variant="contained" color="secondary" onClick={() => onRemove(layer.id)} disabled={isOutputLayer}>
          Remove Layer
        </Button>
      </Grid>
    </Grid>
  );
};

export default LayerConfigurator;
