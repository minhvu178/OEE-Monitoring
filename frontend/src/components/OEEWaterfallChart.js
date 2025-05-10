import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const OEEWaterfallChart = ({ data }) => {
  if (!data || !data.waterfallData) {
    return <div>No data available</div>;
  }
  
  // Colors for different steps in waterfall
  const colors = {
    'Total Equipment Time': '#2196F3',
    'Non-Production': '#FF5722',
    'Manned Time': '#4CAF50',
    'Batch Specific': '#FF9800',
    'Production Time': '#8BC34A',
    'Loss During Operation': '#F44336',
    'Operating Time': '#00BCD4',
    'Valued Operating Time': '#3F51B5'
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${data.name}: ${Math.abs(data.value).toFixed(2)} hours`}</p>
          {data.value < 0 && <p className="desc">Loss time</p>}
        </div>
      );
    }
    
    return null;
  };
  
  // Process data for waterfall chart
  const processWaterfallData = (waterfallData) => {
    let cumulative = 0;
    
    return waterfallData.map((item, index) => {
      const start = cumulative;
      cumulative += item.value;
      
      return {
        ...item,
        start,
        end: cumulative,
        // For bars that represent losses (negative values)
        fill: colors[item.name] || '#8884d8',
      };
    });
  };
  
  const processedData = processWaterfallData(data.waterfallData);
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={processedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {/* Starting values */}
        <Bar 
          dataKey="start" 
          stackId="stack" 
          fill="none" 
          isAnimationActive={false} 
        />
        {/* Actual bars - positive or negative */}
        <Bar 
          dataKey="value" 
          stackId="stack" 
          fill={(entry) => colors[entry.name] || '#8884d8'} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default OEEWaterfallChart; 