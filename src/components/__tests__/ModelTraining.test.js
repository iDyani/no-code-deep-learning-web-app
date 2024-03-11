// ModelTrainingComponent.test.js
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import ModelTrainingComponent from '../ModelTrainingComponent';
import * as api from '../api';

describe('ModelTrainingComponent', () => {
  it('renders correctly and allows user interaction', () => {
    // Render the component
    const { getByLabelText, getByText } = render(<ModelTrainingComponent />);

    // Verify the epochs input is rendered
    const epochsInput = getByLabelText(/epochs:/i);
    expect(epochsInput).toBeTruthy();

    // Verify the "Train Model" button is rendered
    const trainButton = getByText(/train model/i);
    expect(trainButton).toBeTruthy();

    // Simulate entering a value into the epochs input
    fireEvent.change(epochsInput, { target: { value: '10' } });
    expect(epochsInput.value).toBe('10');
  });
});