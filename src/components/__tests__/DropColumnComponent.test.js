// Import necessary utilities from testing library
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the api module
jest.mock('../api', () => ({
  getColumns: jest.fn(),
  dropColumns: jest.fn()
}));
import DropColumnsComponent from '../DropColumnsComponent';
import { getColumns, dropColumns } from '../api';

// Define some mock columns for testing purposes
const mockColumns = ['Age', 'Gender', 'Salary'];

describe('DropColumnsComponent', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    getColumns.mockClear();
    dropColumns.mockClear();
  });

  it('fetches and displays available columns on initial render', async () => {
    getColumns.mockResolvedValueOnce(mockColumns);
    render(<DropColumnsComponent onDataUpdated={() => {}} />);

    // Expect getColumns to have been called
    expect(getColumns).toHaveBeenCalled();

    // Wait for the component to update with the fetched columns
    for (let column of mockColumns) {
      expect(await screen.findByText(column)).toBeInTheDocument();
    }
  });

  it('handles checkbox selection properly', async () => {
    getColumns.mockResolvedValueOnce(mockColumns);
    render(<DropColumnsComponent onDataUpdated={() => {}} />);

    // Wait for the columns to be displayed
    await waitFor(() => expect(getColumns).toHaveBeenCalledTimes(1));

    // Simulate checking the 'Age' checkbox
    const ageCheckbox = await screen.findByLabelText('Age');
    fireEvent.click(ageCheckbox);

    // Assert 'Age' checkbox is checked
    expect(ageCheckbox).toBeChecked();
  });

  it('submits selected columns and displays status', async () => {
    getColumns.mockResolvedValueOnce(mockColumns);
    dropColumns.mockResolvedValueOnce('Success');
    const mockOnDataUpdated = jest.fn();
  
    render(<DropColumnsComponent onDataUpdated={mockOnDataUpdated} />);
  
    // Wait for the columns to be fetched and rendered
    await waitFor(() => expect(getColumns).toHaveBeenCalledTimes(1));
  
    // Interact with the UI as the user would
    const ageCheckbox = await screen.findByLabelText('Age');
    fireEvent.click(ageCheckbox);
    fireEvent.click(screen.getByText('Drop Selected Columns'));
  
    // Wait for the mock dropColumns function to be called
    await waitFor(() => expect(dropColumns).toHaveBeenCalledWith(['Age']));
  
    // Adjust the matcher to be more flexible or correct
    const statusMessage = await screen.findByText(/dropped successfully/i);
  
    expect(statusMessage).toBeInTheDocument();
    expect(mockOnDataUpdated).toHaveBeenCalledTimes(1);
  });

  it('skips dropping columns and notifies parent', async () => {
    render(<DropColumnsComponent onDataUpdated={() => {}} />);

    // Click on 'Proceed without Dropping Columns' button
    fireEvent.click(screen.getByText('Proceed without Dropping Columns'));

    // Expect some status message indicating skipping of column drop
    expect(screen.getByText('No columns were dropped.')).toBeInTheDocument();
  });
});