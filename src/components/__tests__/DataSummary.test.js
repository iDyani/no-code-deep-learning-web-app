import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor, screen } from '@testing-library/react';
import DataSummary from '../DataSummary';
import { getSummaryData } from '../api';

jest.mock('../api', () => ({
  getSummaryData: jest.fn()
}));

describe('DataSummary Component Tests', () => {
  beforeEach(() => {
    // Clear any mocks and settings before each test to ensure a clean state
    jest.resetAllMocks();
  });

  it('initially renders with a prompt message to upload data', () => {
    // Render the DataSummary component with prop indicating no data uploaded yet
    render(<DataSummary dataUploaded={false} />);
    // Expect to find a message prompting the user to upload data
    expect(screen.getByText(/Please upload a data file to view the summary./i)).toBeInTheDocument();
  });

  it('displays data summary after data is uploaded successfully', async () => {
    // Mock the getSummaryData API call to return sample summary data
    getSummaryData.mockResolvedValue({
      columns: ['Column1', 'Column2'],
      summary: {
        Column1: { data_type: 'number', missing_values: 3, percent_missing: 30 },
        Column2: { data_type: 'string', missing_values: 0, percent_missing: 0 }
      },
      row_count: 10,
      duplicate_count: 2
    });

    // Render the DataSummary component with prop indicating data has been uploaded
    render(<DataSummary dataUploaded={true} />);

    // Wait for the component to update based on the mock API response
    await waitFor(() => {
      // Verify that the summary data is displayed as expected
      expect(screen.getByText('Column1')).toBeInTheDocument();
      expect(screen.getByText('number')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('30.00%')).toBeInTheDocument();
      // Additional checks for the second column and overall summary
      expect(screen.getByText('Column2')).toBeInTheDocument();
      expect(screen.getByText('string')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });
  });
});