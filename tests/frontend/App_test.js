import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/components/App';

describe('App Component Tests', () => {
    // Test for initial rendering of the App component
    test('renders App component without crashing', () => {
        render(<App />);
        expect(screen.getByText(/No-code Deep Learning Web App/i)).toBeInTheDocument();
    });

    // Test for rendering the data upload section
    test('renders data upload section', () => {
        render(<App />);
        expect(screen.getByText(/Upload Data/i)).toBeInTheDocument();
    });

    // Test for rendering the data visualization section
    test('renders data visualization section', () => {
        render(<App />);
        expect(screen.getByText(/Data Visualization/i)).toBeInTheDocument();
    });

    // Test for rendering the GPT-3 Insights section
    test('renders GPT-3 Insights section', () => {
        render(<App />);
        expect(screen.getByText(/GPT-3 Insights/i)).toBeInTheDocument();
    });

    // Test for rendering the data preprocessing section
    test('renders data preprocessing section', () => {
        render(<App />);
        expect(screen.getByText(/Data Preprocessing/i)).toBeInTheDocument();
    });

    // Add more tests as needed for different components and functionalities
});

