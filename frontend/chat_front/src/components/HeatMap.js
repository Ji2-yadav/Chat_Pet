import React from 'react';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import './Chat.css';
import './Graph.css'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const HeatMapChart = ({ graph }) => {
    if (!graph || !graph.heat_map) {
        return <div></div>
      }

    const predefinedColors = [
    'rgba(75, 192, 192, 0.5)',
    'rgba(255, 99, 132, 0.5)',
    'rgba(255, 205, 86, 0.5)',
    ];

  const data = {
    datasets: graph.heat_map.map((item, index) => {
      let rad = 1;
      if(item.cl_values[2])
            rad = item.cl_values[2]
      else
            rad = item.cl_values[1]
      
      const minValue = Math.min(...rad);
      const maxValue = Math.max(...rad);
      
      // Define the desired range
      const minRange = 10;
      const maxRange = 30;
      const colorIndex = index % predefinedColors.length;

      
      
      return {
        label: item.cl_names[0] + ' vs ' + item.cl_names[1],
        data: item.cl_values[0].map((x, dataIndex) => ({
          x: x,
          y: item.cl_values[1][dataIndex],
          r: mapValueToRange(rad[dataIndex], minValue, maxValue, minRange, maxRange),
        })),
        backgroundColor: predefinedColors[colorIndex],
      };
    }),
  };
  
  // Function to map a value from one range to another
  function mapValueToRange(value, fromMin, fromMax, toMin, toMax) {
    return (value - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin;
  }
  

  const options = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: graph.heat_map[0].cl_names[0],
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: graph.heat_map[0].cl_names[1],
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

export default HeatMapChart;
