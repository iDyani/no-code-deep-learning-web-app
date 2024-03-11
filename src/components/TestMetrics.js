import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const TestMetrics = ({ metrics }) => {
  // Render a card displaying test metrics (e.g., accuracy, precision, recall)
  return (
    <Card 
      sx={{ 
        margin: 2,
        boxShadow: '0px 0px 15px rgba(0,0,0,0.2)',
        borderRadius: '10px',
        minWidth: 275 // Ensures the card has a minimum width for better layout
      }} 
      variant="outlined" // Use an outlined variant for the card for visual distinction
    >
      <CardContent>
        <Typography 
          sx={{ 
            fontSize: '1.2rem', // Larger font size for the title
            fontWeight: 'bold', // Bold font weight for the title
            color: 'primary.main', // Use the primary color theme for the title
            marginBottom: 2 // Add bottom margin for spacing
          }}
          gutterBottom // Adds bottom margin to typography
        >
          Test Metrics
        </Typography>
        <Grid container spacing={2}> {/* Uses a grid layout to organize metric values */}
          {Object.entries(metrics).map(([key, value]) => (
            <Grid item xs={4} key={key}> {/* Each metric takes up 4 columns in the grid */}
              <Typography 
                variant="h6" // Use h6 variant for metric names for semantic structure
                component="div"
                sx={{ fontWeight: 'medium' }} // Medium font weight for metric names
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} {/* Capitalize the first letter of the metric name */}
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: '1rem', // Standard font size for metric values
                  color: 'text.secondary' // Use secondary text color for metric values
                }}
              >
                {`${(value * 100).toFixed(2)}%`} {/* Convert metric values to percentage format */}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TestMetrics;
