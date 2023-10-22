import React from 'react';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineController,
  CategoryScale,
  LinearScale,
  LineElement,
} from 'chart.js';
import './Graph.css'

import { Line } from 'react-chartjs-2';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineController,
  CategoryScale,
  LinearScale,
  LineElement
);

const LineChart = ({ graph }) => {
    if (!graph || !graph.line) {
        return <div></div>
      }

      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text:  graph.line[0].cl_names[0],
            },
          },
        },
      };
  
const lineColors = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)'];

const data = {
  datasets: graph.line[0].cl_names.slice(1).map((name, index) => {
    return {
      label: `${name} vs ${graph.line[0].cl_names[0]}`,
      data: graph.line[0].cl_values[0].map((value, dataIndex) => ({
        x: graph.line[0].cl_values[0][dataIndex],
        y: graph.line[0].cl_values[index + 1][dataIndex],
      })),
      borderColor: lineColors[index % lineColors.length], 
      borderWidth: 1,
      fill: true,
    };
  }),
};

  
  
  

  return (
    <div className='chart-area'>
      <Line options={options} data={data} />
    </div>
  );
};

export default LineChart;
