import React, { useState, useRef } from 'react';
import { uploadData } from './api'; // Function to call the API for uploading data
import '../styles/App.css';

function DataUpload({ setDataUploaded }) {
    const [file, setFile] = useState(null); // State to store the selected file
    const [uploading, setUploading] = useState(false); // State to indicate if the file is being uploaded
    const [progress, setProgress] = useState(0); // State to track upload progress
    const [message, setMessage] = useState(''); // State to store messages to the user
    const fileInputRef = useRef(null); // Reference to the hidden file input element

    const handleDrop = (e) => {
        // Handle file drop
        e.preventDefault(); // Prevent default browser behavior
        e.stopPropagation(); // Stop the event from propagating further
        const droppedFile = e.dataTransfer.files[0]; // Get the dropped file
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            // Check if the file is a CSV
            setFile(droppedFile); // Set the file state
            setMessage(`File selected: ${droppedFile.name}`); // Set the message state
        } else {
            setMessage('Only CSV files are accepted'); // Inform the user about acceptable file type
        }
    };

    const handleFileChange = (e) => {
        // Handle file selection via the file input
        const selectedFile = e.target.files[0]; // Get the selected file
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            // Check if the file is a CSV
            setFile(selectedFile); // Set the file state
            setMessage(`File selected: ${selectedFile.name}`); // Set the message state
        } else {
            setMessage('Only CSV files are accepted'); // Inform the user about acceptable file type
        }
    };

    const handleSubmit = async (e) => {
        // Handle file upload on form submission
        e.preventDefault(); // Prevent form submission
        if (!file) {
            // Check if a file has been selected
            setMessage('Please select a file to upload'); // Inform the user to select a file
            return;
        }
        try {
            setUploading(true); // Set uploading state to true
            setMessage(''); // Clear message state
            await uploadData(file, (event) => {
                // Call the API to upload the file
                setProgress(Math.round((100 * event.loaded) / event.total)); // Update progress state
            });
            setMessage('File uploaded successfully'); // Inform the user of successful upload
            setDataUploaded(true); // Notify the parent component that data has been uploaded
        } catch (error) {
            setMessage(`Error uploading file: ${error.message}`); // Display upload error message
        } finally {
            setUploading(false); // Set uploading state to false
        }
    };

    const openFileDialog = () => {
        // Open the file dialog
        fileInputRef.current.click(); // Trigger click on the hidden file input
    }

    return (
        <div className="DataUpload">
            <h2>Data Upload</h2>
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
            <button className='upload_button' onClick={handleSubmit} disabled={uploading || !file}>Upload</button>
        </div>
    );
}

export default DataUpload;
