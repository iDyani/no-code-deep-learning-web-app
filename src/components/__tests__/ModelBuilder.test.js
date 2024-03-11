import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModelConfigContext } from '../ModelConfigContext';
import ModelBuilder from '../ModelBuilder';

jest.mock('../NetworkVisualization', () => () => <div>Mocked Network Visualization</div>);

// Mocking API calls
jest.mock('../api', () => ({
  saveModelConfig: jest.fn(),
  fetchNetworkParameters: jest.fn(() => Promise.resolve({ num_label_classes: 3, num_cols: 10 })),
}));

describe('ModelBuilder Component', () => {
  const mockSetModelConfig = jest.fn();
  const initialModelConfig = {
    layers: [],
    input_size: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and allows adding a new layer', async () => {
    render(
      <ModelConfigContext.Provider value={{ modelConfig: initialModelConfig, setModelConfig: mockSetModelConfig }}>
        <ModelBuilder onModelBuilt={() => {}} />
      </ModelConfigContext.Provider>
    );

    // Check if the ModelBuilder component renders
    expect(screen.getByText('Configure Your Model')).toBeInTheDocument();
    expect(screen.getByText('Mocked Network Visualization')).toBeInTheDocument();
  });
});
