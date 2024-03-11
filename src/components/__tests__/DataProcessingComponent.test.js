import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataProcessingComponent from '../DataPreprocessing';
import * as api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  sendOptionsToBackend: jest.fn(),
  getComparisonSummaryData: jest.fn(),
}));

// Mock window.alert
window.alert = jest.fn();

describe('DataProcessingComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default state and options', async () => {
    render(<DataProcessingComponent />);
    // Checkboxes should not be checked by default
    expect(screen.getByText('Remove Duplicates').previousSibling).not.toBeChecked();
    expect(screen.getByText('Handle Missing Values').previousSibling).not.toBeChecked();
    // Radio buttons for feature scaling should not be checked by default
    expect(screen.getByText('Normalization').previousSibling).not.toBeChecked();
    expect(screen.getByText('Standardization').previousSibling).not.toBeChecked();
  });

  it('handles option selection and form submission', async () => {
    api.sendOptionsToBackend.mockResolvedValueOnce({});
    api.getComparisonSummaryData.mockResolvedValueOnce({ before: {}, after: {} });

    render(<DataProcessingComponent />);
    
    // Simulate user interactions
    fireEvent.click(screen.getByText('Remove Duplicates').previousSibling);
    fireEvent.click(screen.getByText('Apply'));
    
    await waitFor(() => expect(api.sendOptionsToBackend).toHaveBeenCalled());
    // Expect the getComparisonSummaryData to have been called after the form submission
    expect(api.getComparisonSummaryData).toHaveBeenCalled();
  });

  it('displays error message on API call failure', async () => {
    // Mock the API call to reject with an error.
    api.sendOptionsToBackend.mockRejectedValue(new Error('Failed to process data'));
  
    render(<DataProcessingComponent />);
  
    // Simulate selecting an option that would trigger an API call.
    fireEvent.click(screen.getByText('Remove Duplicates').previousSibling);
  
    // Simulate form submission.
    fireEvent.click(screen.getByText('Apply'));
  
    // Expect an alert with the specific error message.
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Failed to process data'));
  });
  
});