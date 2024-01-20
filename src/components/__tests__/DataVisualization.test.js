import React from 'react';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import DataVisualization from '../DataVisualization';
import { getVisualizationData, getColumns } from '../api';

jest.mock('../api');

describe('DataVisualization Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders and initializes with column selection', async () => {
    getColumns.mockResolvedValue(['Column1', 'Column2']);
    getVisualizationData.mockResolvedValue({
      labels: ['Label1', 'Label2'],
      values: [10, 20]
    });

    render(<DataVisualization dataUploaded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Visualization')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Column1' })).toBeInTheDocument();
    });
  });

  it('displays chart on column selection', async () => {
    getColumns.mockResolvedValue(['Column1', 'Column2']);
    getVisualizationData.mockResolvedValue({
      labels: ['Label1', 'Label2'],
      values: [10, 20]
    });

    const { getByRole, getByTestId } = render(<DataVisualization dataUploaded={true} />);
    const select = getByRole('combobox');

    fireEvent.change(select, { target: { value: 'Column1' } });

    await waitFor(() => {
      expect(getVisualizationData).toHaveBeenCalledWith('Column1');
      expect(getByTestId('chart')).toBeInTheDocument();});
  });


});