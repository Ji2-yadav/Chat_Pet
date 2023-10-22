import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../css/Graph.css'

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ graph }) => {
  if (!graph || !graph.bar) {
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
          text:  graph.bar[0].cl_names[0],
        },
      },
    },
  };
  

  
const barColors = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)']; // Add more colors as needed

const data = {
datasets: graph.bar[0].cl_names.slice(1).map((name, index) => {
    return {
    label: `${name} vs ${graph.bar[0].cl_names[0]}`,
    data: graph.bar[0].cl_values[0].map((value, dataIndex) => ({
        x: graph.bar[0].cl_values[0][dataIndex],
        y: graph.bar[0].cl_values[index + 1][dataIndex],
    })),
    backgroundColor: barColors[index % barColors.length], // Use a different color for each line
    borderWidth: 0,
    fill: true,
    };
}),
};


  return (
    <div className='chart-area'>
      <Bar options={options} data={data} />
    </div>
  );
};

export default BarChart;
