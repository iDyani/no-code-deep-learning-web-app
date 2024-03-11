import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { getVisualizationData, getColumns } from './api';
import '../styles/App.css';

Chart.register(...registerables);

function generateRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

function DataVisualization({ dataUploaded }) {
    const [columns, setColumns] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState('');
    const [chartData, setChartData] = useState({});
    const [colorMapping, setColorMapping] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (dataUploaded) {
            getColumns().then(cols => {
                if (cols.length > 0) {
                    setColumns(cols);
                    setSelectedColumn(cols[0]);
                } else {
                    setError('No columns available for visualization.');
                }
            }).catch(error => {
                console.error('Error fetching column names:', error);
                setError('Error fetching column names.');
            });
        }
    }, [dataUploaded]);

    useEffect(() => {
        if (selectedColumn) {
            getVisualizationData(selectedColumn).then(data => {
                const backgroundColors = data.labels.map(generateRandomColor);
                const borderColor = backgroundColors.map(color => color.replace('0.5', '1'));
                const newColorMapping = data.labels.reduce((acc, label, index) => {
                    acc[label] = backgroundColors[index];
                    return acc;
                }, {});

                setColorMapping(newColorMapping);
                setChartData({
                    labels: data.labels,
                    datasets: [{
                        label: selectedColumn,
                        data: data.values,
                        backgroundColor: backgroundColors,
                        borderColor: borderColor,
                        borderWidth: 1
                    }]
                });
            }).catch(error => {
                console.error('Error fetching visualization data:', error);
                setError('Error fetching visualization data.');
            });
        }
    }, [selectedColumn]);

    const handleChange = (event) => {
        setSelectedColumn(event.target.value);
    };

    const renderCustomLegend = () => {
        return (
            <div className="chart-legend" data-testid="chart">
                {Object.entries(colorMapping).map(([label, color]) => (
                    <div key={label} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: color }}></span>
                        <span className="legend-label">{label}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="DataVisualization">
            <h2>Data Visualization</h2>
            {!dataUploaded ? (
                <p>Please upload a data file to visualize.</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <select className="data-dropdown" onChange={handleChange} value={selectedColumn}>
                        {columns.map(label => (
                            <option key={label} value={label}>{label}</option>
                        ))}
                    </select>
                    {chartData.labels && chartData.labels.length > 0 && (
                        <>
                            <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} />
                            {renderCustomLegend()}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default DataVisualization;