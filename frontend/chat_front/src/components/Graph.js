import React, { useState, useEffect } from 'react';
import BubbleChart from './Bubble';
import BarChart from './Bar';
import HeatmapChart from './HeatMap';
import LineChart from './Line';
import PieChart from './Pie';
import '../css/Graph.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faBarChart, faChartArea, faChartColumn, faChartSimple, faChartGantt, faChartLine, faChartPie, faCheck, faCheckSquare, faEdit, faFire, faHandsBubbles, faPen
} from '@fortawesome/free-solid-svg-icons';

const Graph = ({ graph }) => {
  const [activeChart, setActiveChart] = useState(null);

  useEffect(() => {
    // Set the initial active chart based on the available data
    if (graph) {
      if (graph.bubble) setActiveChart('bubble');
      else if (graph.bar) setActiveChart('bar');
      else if (graph.heat_map) setActiveChart('heatmap');
      else if (graph.line) setActiveChart('line');
      else if (graph.pie) setActiveChart('pie');
    }
  }, [graph]);

  const toggleChart = (chartType) => {
    setActiveChart(activeChart === chartType ? null : chartType);
  };

  return (
    <div className='graph-div'>
      <div className='chart-buttons'>
        {graph && graph.bubble && (
          <FontAwesomeIcon
            className={`chart-icons ${activeChart === 'bubble' ? 'active' : ''}`}
            onClick={() => toggleChart('bubble')}
            icon={faChartColumn}
          />
        )}
        {graph && graph.bar && (
          <FontAwesomeIcon
            className={`chart-icons ${activeChart === 'bar' ? 'active' : ''}`}
            onClick={() => toggleChart('bar')}
            icon={faChartSimple}
          />
        )}
        {graph && graph.heat_map && (
          <FontAwesomeIcon
            className={`chart-icons ${activeChart === 'heatmap' ? 'active' : ''}`}
            onClick={() => toggleChart('heatmap')}
            icon={faChartArea}
          />
        )}
        {graph && graph.line && (
          <FontAwesomeIcon
            className={`chart-icons ${activeChart === 'line' ? 'active' : ''}`}
            onClick={() => toggleChart('line')}
            icon={faChartLine}
          />
        )}
        {graph && graph.pie && (
          <FontAwesomeIcon
            className={`chart-icons ${activeChart === 'pie' ? 'active' : ''}`}
            onClick={() => toggleChart('pie')}
            icon={faChartPie}
          />
        )}
      </div>
      {activeChart === 'bubble' && <BubbleChart graph={graph} />}
      {activeChart === 'bar' && <BarChart graph={graph} />}
      {activeChart === 'heatmap' && <HeatmapChart graph={graph} />}
      {activeChart === 'line' && <LineChart graph={graph} />}
      {activeChart === 'pie' && <PieChart graph={graph} />}
    </div>
  );
};

export default Graph;
