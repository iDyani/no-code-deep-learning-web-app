import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import LayerConfigurator from '../LayerConfigurator';

describe('LayerConfigurator', () => {
  const mockOnRemove = jest.fn();
  const mockOnUpdate = jest.fn();
  const layerProps = {
    layer: { id: '1', type: 'dense', settings: { nodes: 32, activation: 'relu' } },
    onRemove: mockOnRemove,
    onUpdate: mockOnUpdate,
    isOutputLayer: false,
  };

  it('allows updating layer settings', () => {
    const { getByLabelText, getByText } = render(<LayerConfigurator {...layerProps} />);
    
    fireEvent.change(getByLabelText('Number of Nodes'), { target: { value: 64 } });
    fireEvent.click(getByText('Remove Layer'));
    
    expect(mockOnUpdate).toHaveBeenCalledWith('1', expect.any(Object));
    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });
});
