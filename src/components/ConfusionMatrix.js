import React from 'react'; // Import React library for building UI components.
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'; // Import necessary Material UI components.

// ConfusionMatrix functional component that takes `matrix` and `labels` as props.
const ConfusionMatrix = ({ matrix, labels }) => {
  // Dynamically generates labels if not provided based on the length of the matrix.
  const definedLabels = labels || Array.from({ length: matrix.length }, (_, i) => i.toString());

  return (
    // Paper component from Material UI to serve as the container with custom styles applied for margin, overflow, boxShadow, and borderRadius.
    <Paper 
      sx={{ 
        margin: 2, 
        overflowX: 'auto',
        boxShadow: '0px 0px 15px rgba(0,0,0,0.2)',
        borderRadius: '10px'
      }} 
      elevation={3}
    >
      {/* Typography component for the title of the confusion matrix, with custom styles for padding, fontWeight, fontSize, textAlign, and color. */}
      <Typography 
        sx={{ 
          padding: 2,
          fontWeight: 'bold',
          fontSize: '1.2rem',
          textAlign: 'center',
          color: 'primary.main',
        }}
      >
        Confusion Matrix
      </Typography>
      {/* TableContainer component to hold the table. */}
      <TableContainer>
        {/* Table component with custom styles and an aria-label for accessibility. */}
        <Table 
          sx={{ minWidth: 650 }} 
          aria-label="confusion matrix"
          size="small"
        >
          {/* TableHead component to define the header row of the table. */}
          <TableHead>
            {/* TableRow for the header, with custom styles applied to all TableCell children (th elements). */}
            <TableRow sx={{ '& th': { fontWeight: 'bold', backgroundColor: 'primary.light', color: 'white' } }}>
              {/* TableCell for the corner cell with a forward slash, and TableCell components for each label in `definedLabels`. */}
              <TableCell align="center">/</TableCell>
              {definedLabels.map((label, index) => (
                <TableCell key={index} align="center">{`Predicted: ${label}`}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          {/* TableBody component to define the body of the table. */}
          <TableBody>
            {/* Maps each row of the matrix to a TableRow component, where each cell is represented by a TableCell. */}
            {matrix.map((row, i) => (
              <TableRow key={i} sx={{ '& td, & th': { fontWeight: 'medium' } }}>
                <TableCell component="th" scope="row" align="center">{`Actual: ${definedLabels[i]}`}</TableCell>
                {row.map((cell, j) => (
                  <TableCell key={j} align="center">{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ConfusionMatrix; // Export the ConfusionMatrix component for use in other parts of the application.
