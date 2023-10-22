import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './Graph.css'


ChartJS.register(Title, Tooltip, Legend, ArcElement);

const PieChart = ({ graph }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    
    if (graph && graph.pie) {
      const ctx = chartRef.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy the existing chart
      }

      const data = {
        labels: graph.pie[0].cl_values[0],
        datasets: [
          {
            label: graph.pie[0].cl_names[1],
            data: graph.pie[0].cl_values[1],
            backgroundColor: generateColors(graph.pie[0].cl_values[0].length),
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
              position: 'left',
            },
            title: {
              display: true,
              position: 'bottom-left',
              text: graph.pie[0].cl_names[1], // Add your chart title here
            },
          },
      };

      chartInstance.current = new ChartJS(ctx, {
        type: 'pie',
        data: data,
        options: options,
      });
    }
  }, [graph]);

  // Function to generate colors from a predefined list
  const generateColors = (count) => {
    const predefinedColors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      // Add more predefined colors here
    ];

    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = predefinedColors[i % predefinedColors.length];
      colors.push(color);
    }
    return colors;
  };

  return (
    <div className='chart-area'>
      <canvas ref={chartRef} width="600" height="600" className='pie'></canvas>
    </div>
  );
};

export default PieChart;
