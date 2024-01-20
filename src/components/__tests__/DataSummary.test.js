import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import DataSummary from '../DataSummary';
import { getSummaryData } from '../api';

jest.mock('../api');

describe('DataSummary Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders with initial message', () => {
    render(<DataSummary dataUploaded={false} />);
    expect(screen.getByText(/Please upload a data file to view the summary./i)).toBeInTheDocument();
  });

  it('displays data summary table after data is uploaded', async () => {
    getSummaryData.mockResolvedValue({
      columns: ['Column1', 'Column2'],
      summary: {
        Column1: { data_type: 'number', missing_values: 2, percent_missing: 20 },
        Column2: { data_type: 'string', missing_values: 0, percent_missing: 0 }
      },
      row_count: 10
    });

    render(<DataSummary dataUploaded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Column1')).toBeInTheDocument();
      expect(screen.getByText('number')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('20.00%')).toBeInTheDocument();
    });
  });

  
});