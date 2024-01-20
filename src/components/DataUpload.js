import React, { useState, useRef } from 'react';
import { uploadData } from './api';
import '../styles/App.css';

function DataUpload({ setDataUploaded }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            setMessage(`File selected: ${droppedFile.name}`);
        } else {
            setMessage('Only CSV files are accepted');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setMessage(`File selected: ${selectedFile.name}`);
        } else {
            setMessage('Only CSV files are accepted');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file to upload');
            return;
        }
        try {
            setUploading(true);
            setMessage('');
            await uploadData(file, (event) => {
                setProgress(Math.round((100 * event.loaded) / event.total));
            });
            setMessage('File uploaded successfully');
            setDataUploaded(true); // Notify the App component that data is uploaded
        } catch (error) {
            setMessage(`Error uploading file: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current.click();
    }

    return (
        <div className="DataUpload">
            <h2 className="section-title">Data Upload</h2>
            <div className="drag-drop-area" data-testid="dropzone"
                 onDrop={handleDrop} 
                 onDragOver={(e) => e.preventDefault()}
                 onClick={openFileDialog}>
                <p>Drag and drop a CSV file here, or click to select a file</p>
                <input type="file" data-testid="file-input"
                       ref={fileInputRef}
                       onChange={handleFileChange} 
                       style={{ display: 'none' }} 
                       accept=".csv" />
            </div>
            {file && <p className="file-info">{message}</p>}
            {uploading && <progress value={progress} max="100">{progress}%</progress>}
            {message && !file && <p className="message">{message}</p>}
            <button onClick={handleSubmit} disabled={uploading || !file}>Upload</button>
        </div>
    );
}

export default DataUpload;
