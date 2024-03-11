import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataUpload from '../DataUpload';
import { uploadData } from '../api';

// Mock the uploadData API function
jest.mock('../api', () => ({
  uploadData: jest.fn(),
}));

describe('DataUpload Component Tests', () => {
  beforeEach(() => {
    uploadData.mockClear();
  });

  it('renders correctly', () => {
    render(<DataUpload setDataUploaded={() => {}} />);
    expect(screen.getByText(/drag and drop a csv file here, or click to select a file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('validates file type on file select', () => {
    render(<DataUpload setDataUploaded={() => {}} />);
    const fileInput = screen.getByTestId('file-input');
    const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
    const nonCsvFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    // Try to upload a non-CSV file
    fireEvent.change(fileInput, { target: { files: [nonCsvFile] } });
    expect(screen.getByText(/only csv files are accepted/i)).toBeInTheDocument();

    // Upload a CSV file
    fireEvent.change(fileInput, { target: { files: [csvFile] } });
    expect(screen.getByText(/file selected: test.csv/i)).toBeInTheDocument();
  });

  it('uploads file successfully', async () => {
    uploadData.mockResolvedValueOnce(); // Mock a successful upload
    render(<DataUpload setDataUploaded={() => {}} />);
    const fileInput = screen.getByTestId('file-input');
    const csvFile = new File(['test'], 'upload.csv', { type: 'text/csv' });
  
    fireEvent.change(fileInput, { target: { files: [csvFile] } });
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
  
    await waitFor(() => expect(uploadData).toHaveBeenCalledWith(csvFile, expect.any(Function)));
    
    // Use waitFor to wait for the message to appear in the document
    await waitFor(() => {
      expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument();
    });
  });
  
  it('displays error message on upload failure', async () => {
    uploadData.mockRejectedValueOnce(new Error('Upload failed'));
    render(<DataUpload setDataUploaded={() => {}} />);
    const fileInput = screen.getByTestId('file-input');
    const csvFile = new File(['test'], 'upload.csv', { type: 'text/csv' });
  
    fireEvent.change(fileInput, { target: { files: [csvFile] } });
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
  
    await waitFor(() => expect(uploadData).toHaveBeenCalledWith(csvFile, expect.any(Function)));
    await waitFor(() => expect(screen.getByText(/error uploading file: Upload failed/i)).toBeInTheDocument());
  });
});
