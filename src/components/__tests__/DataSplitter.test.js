import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataSplitter from '../DataSplitter';
import * as api from '../api';

// Mocking the splitData API call
jest.mock('../api', () => ({
  splitData: jest.fn()
}));

describe('DataSplitter', () => {
  beforeEach(() => {
    // Reset API mocks before each test
    api.splitData.mockClear();
  });

  test('renders with default state values', () => {
    render(<DataSplitter />);
    expect(screen.getByLabelText('Training Data Ratio (%):')).toHaveValue(60);
    expect(screen.getByLabelText('Validation Data Ratio (%):')).toHaveValue(20);
  });

  test('validates input ratios before splitting data', async () => {
    render(<DataSplitter />);
    
    // Set training size to 80% and validation size to 30%, which should trigger an error
    fireEvent.change(screen.getByLabelText('Training Data Ratio (%):'), { target: { value: 80 } });
    fireEvent.change(screen.getByLabelText('Validation Data Ratio (%):'), { target: { value: 30 } });
    fireEvent.click(screen.getByRole('button', { name: /split data/i }));

    await waitFor(() => expect(screen.getByText('The sum of Training and Validation data ratios cannot exceed 100%.')).toBeInTheDocument());
    expect(api.splitData).not.toHaveBeenCalled();
  });

  test('calls splitData API and displays result on successful data splitting', async () => {
    api.splitData.mockResolvedValue({
      train_size: 6000,
      validation_size: 2000,
      test_size: 2000,
      total_size: 10000
    });
  
    render(<DataSplitter />);
  
    // Fill in the form and submit
    fireEvent.change(screen.getByLabelText('Training Data Ratio (%):'), { target: { value: 60 } });
    fireEvent.change(screen.getByLabelText('Validation Data Ratio (%):'), { target: { value: 20 } });
    fireEvent.click(screen.getByRole('button', { name: /split data/i }));
  
    // Await directly for findByText without wrapping in waitFor
    expect(await screen.findByText('Training Set')).toBeInTheDocument();
    expect(await screen.findByText('6000')).toBeInTheDocument();
  });
  
});