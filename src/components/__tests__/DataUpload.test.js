import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DataUpload from '../DataUpload';
import { uploadData } from '../api';

jest.mock('../api', () => ({
  uploadData: jest.fn(() => Promise.resolve()),
}));

describe('DataUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload component', () => {
    render(<DataUpload setDataUploaded={() => {}} />);
    expect(screen.getByText(/Drag and drop a CSV file here/i)).toBeInTheDocument();
  });

  it('accepts a file on drop', async () => {
    const setDataUploaded = jest.fn();
    render(<DataUpload setDataUploaded={setDataUploaded} />);
    const dropzone = screen.getByTestId('dropzone');
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    await waitFor(() => expect(uploadData).toHaveBeenCalledWith(file, expect.any(Function)));
    expect(setDataUploaded).toHaveBeenCalledWith(true);
  });

  it('shows error message for non-CSV file drop', async () => {
    render(<DataUpload setDataUploaded={() => {}} />);
    const dropzone = screen.getByTestId('dropzone');
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(await screen.findByText(/Only CSV files are accepted/i)).toBeInTheDocument();
  });

  it('uploads file on manual selection', async () => {
    const setDataUploaded = jest.fn();
    render(<DataUpload setDataUploaded={setDataUploaded} />);
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(uploadData).toHaveBeenCalledWith(file, expect.any(Function)));
    expect(setDataUploaded).toHaveBeenCalledWith(true);
  });
});
