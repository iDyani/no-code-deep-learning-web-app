import React, { useEffect, useRef, useContext } from 'react';
import * as d3 from 'd3';
import { ModelConfigContext } from './ModelConfigContext';
import { fetchNetworkParameters } from './api';

const NetworkVisualization = () => {
  // Access the model configuration from the ModelConfigContext
  const { modelConfig } = useContext(ModelConfigContext);
  // Reference for the SVG canvas where the network will be drawn
  const svgRef = useRef(null);
  // Stores fetched network parameters, specifically the number of label classes
  const networkParamsRef = useRef({ num_label_classes: null });

  // Effect hook to fetch network parameters once and draw the network visualization
  useEffect(() => {
    if (!networkParamsRef.current.num_label_classes) {
      fetchNetworkParameters().then(params => {
        networkParamsRef.current = params;
        drawNetwork(modelConfig); // Trigger a redraw with the fetched parameters
      });
    }
  }, []);

  // Effect hook to redraw the network visualization whenever the model configuration changes
  useEffect(() => {
    drawNetwork(modelConfig);
  }, [modelConfig]);

  // Function to draw the neural network visualization based on the model configuration
  const drawNetwork = (config) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear the SVG canvas before redrawing

    const width = svgRef.current.clientWidth; // Obtain SVG canvas width
    const height = svgRef.current.clientHeight; // Obtain SVG canvas height
    const padding = 10; // Padding around the network visualization
    const nodeRadius = 15; // Radius of each neuron (circle) in the network

    // Filter out dropout layers for visualization
    const denseLayers = config.layers.filter(layer => layer.type !== 'dropout');
    const layerHeight = height / (denseLayers.length + 2); // Calculate layer height to distribute layers vertically

    // Draw each dense layer
    denseLayers.forEach((layer, i) => {
      const nodes = layer.settings.nodes || 1; // Default to 1 node if not specified
      const layerY = layerHeight * (i + 1); // Calculate Y position for the layer

      drawLayer(svg, nodes, width, layerY, nodeRadius, padding, 'steelblue'); // Draw layer nodes

      // Draw edges between layers if not the first layer
      if (i > 0) {
        const prevLayerNodes = denseLayers[i - 1].settings.nodes || 1; // Nodes in the previous layer
        drawEdges(svg, prevLayerNodes, nodes, width, layerHeight * i, layerY, padding, nodeRadius); // Draw edges between layers
      }
    });

    // Draw the output layer
    const outputLayerNodes = networkParamsRef.current.num_label_classes || 1; // Nodes in the output layer
    drawLayer(svg, outputLayerNodes, width, height - layerHeight, nodeRadius, padding, 'lightgreen'); // Draw output layer nodes

    // Optionally draw edges to the output layer from the last dense layer
    if (denseLayers.length > 0) {
      const lastLayerNodes = denseLayers[denseLayers.length - 1].settings.nodes || 1;
      drawEdges(svg, lastLayerNodes, outputLayerNodes, width, height - layerHeight * 2, height - layerHeight, padding, nodeRadius); // Draw edges to the output layer
    }
  };  

  // Draws a single layer of nodes
  const drawLayer = (svg, nodes, width, y, nodeRadius, padding, fillColor) => {
    const spaceBetween = (width - 2 * padding) / (nodes + 1); // Calculate horizontal spacing between nodes

    // Draw each node in the layer
    for (let i = 0; i < nodes; i++) {
      svg.append('circle')
        .attr('cx', padding + spaceBetween * (i + 1)) // Calculate X position for each node
        .attr('cy', y) // Y position is the same for all nodes in the layer
        .attr('r', nodeRadius) // Set node radius
        .attr('fill', fillColor); // Fill color for the nodes
    }
  };

  // Draws edges between two layers
  const drawEdges = (svg, fromNodes, toNodes, width, fromY, toY, padding, nodeRadius) => {
    const fromSpaceBetween = (width - 2 * padding) / (fromNodes + 1); // Spacing between nodes in the from layer
    const toSpaceBetween = (width - 2 * padding) / (toNodes + 1); // Spacing between nodes in the to layer

    for (let i = 0; i < fromNodes; i++) {
      for (let j = 0; j < toNodes; j++) {
        svg.append('line')
          .attr('x1', padding + fromSpaceBetween * (i + 1))
          .attr('y1', fromY)
          .attr('x2', padding + toSpaceBetween * (j + 1))
          .attr('y2', toY)
          .attr('stroke', '#aaa')
          .attr('stroke-width', 1);
      }
    }
  };

  return <svg ref={svgRef} width="100%" height="600px" style={{ border: '1px solid black', overflow: 'hidden' }} />;
};

export default NetworkVisualization;
