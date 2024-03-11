import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabelColumnSelector from '../LabelColumnSelector'; 
import { getColumnsForLabel, selectLabelColumn } from '../api';

// Mock the API module
jest.mock('../api', () => ({
  getColumnsForLabel: jest.fn(),
  selectLabelColumn: jest.fn()
}));

describe('LabelColumnSelector', () => {
  const mockColumns = ['Column1', 'Column2', 'Column3'];
  const mockOnDataLabelSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches columns and renders select options', async () => {
    getColumnsForLabel.mockResolvedValue(mockColumns);
    render(<LabelColumnSelector onDataLabelSelected={mockOnDataLabelSelected} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      mockColumns.forEach(column => {
        expect(screen.getByText(column)).toBeInTheDocument();
      });
    });
  });

  it('handles selection and triggers onDataLabelSelected', async () => {
    getColumnsForLabel.mockResolvedValue(mockColumns);
    render(<LabelColumnSelector onDataLabelSelected={mockOnDataLabelSelected} />);

    await waitFor(() => expect(getColumnsForLabel).toHaveBeenCalled());

    // Adjust the test to wait for the select element using findByRole with the specified aria-label.
    fireEvent.change(await screen.findByRole('combobox', { name: 'Select column' }), { target: { value: 'Column2' } });
    fireEvent.click(screen.getByText('Select'));

    // Then proceed with your assertions as before.
    await waitFor(() => expect(selectLabelColumn).toHaveBeenCalledWith('Column2'));
    expect(mockOnDataLabelSelected).toHaveBeenCalledWith('Column2');

  });

  it('displays error message if fetching columns fails', async () => {
    getColumnsForLabel.mockRejectedValue(new Error('Failed to fetch columns'));
    render(<LabelColumnSelector onDataLabelSelected={mockOnDataLabelSelected} />);

    await waitFor(() => expect(screen.getByText('Failed to fetch columns')).toBeInTheDocument());
  });

  it('displays error message if column selection fails', async () => {
    getColumnsForLabel.mockResolvedValue(mockColumns);
    selectLabelColumn.mockRejectedValue(new Error('Failed to select label column'));
    render(<LabelColumnSelector onDataLabelSelected={mockOnDataLabelSelected} />);

    await waitFor(() => expect(getColumnsForLabel).toHaveBeenCalled());

    fireEvent.change(await screen.findByRole('combobox', { name: 'Select column' }), { target: { value: 'Column2' } });
    fireEvent.click(screen.getByText('Select'));

    await waitFor(() => expect(screen.getByText('Failed to select label column')).toBeInTheDocument());
  });
});