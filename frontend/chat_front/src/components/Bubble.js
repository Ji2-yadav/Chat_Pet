import React from 'react';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import './Graph.css'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const BubbleChart = ({ graph }) => {
    if (!graph || !graph.bubble) {
        return <div></div>
      }

  // Function to normalize data to the [0, 1] range
  const normalizeData = (data) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    return data.map((value) => (value - min) / (max - min));
  };

  // Function to generate random colors
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const getRandomRadius = () =>{
    let radius = Math.floor(Math.random() * 5)+5
    return radius
  }

  const data = {
    datasets: graph.bubble.map((item, index) => {
      // Normalize the data for both x and y coordinates
      const normalizedX = normalizeData(item.cl_values[0]);
      const normalizedY = normalizeData(item.cl_values[1]);
      const randomColor = getRandomColor();
      const randomRadius = 5;
      return {
        label: item.cl_names[0] + ' vs ' + item.cl_names[1],
        data: normalizedX.map((x, dataIndex) => ({
          x: x,
          y: normalizedY[dataIndex],
          r: randomRadius,
        })),
        backgroundColor: randomColor, // Assign random color
      };
    }),
  };

  const options = {
    scales: {
      x: {
        beginAtZero: true,
        max: 1.2,
        min: -0.2,
        title: {
          display: true,
          text: graph.bubble[0].cl_names[0],
        },
      },
      y: {
        beginAtZero: true,
        max: 1.2,
        min: -0.2,
        title: {
          display: true,
          text: graph.bubble[0].cl_names[1],
        },
      },
    },
  };
  
  return (
    <div className='chart-area'>
      <Bubble data={data} options={options} />
    </div>
  );
};

export default BubbleChart;
