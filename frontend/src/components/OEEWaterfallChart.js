import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ReferenceLine
} from 'recharts';

const OEEWaterfallChart = ({ data }) => {
  if (!data || !data.waterfallData) {
    return <div>No data available</div>;
  }
  
  // Colors for different steps in waterfall
  const colors = {
    'Total Equipment Time': '#4682B4',       // Blue
    'Non-Production': '#FF6347',             // Red (negative)
    'Manned Time': '#8BC34A',                // Green
    'Batch Specific': '#FF9800',             // Orange (negative)
    'Production Time': '#2196F3',            // Blue
    'Loss During Operation': '#F44336',      // Red (negative)
    'Operating Time': '#00BCD4',             // Cyan
    'Operating Loss': '#E91E63',             // Pink (negative)
    'Valued Operating Time': '#4CAF50'       // Green
  };
  
  // Process data for waterfall chart
  const processWaterfallData = (waterfallData) => {
    let cumulative = 0;
    
    return waterfallData.map((item) => {
      const start = cumulative;
      
      // For negative values, we'll show a negative bar
      // For positive values, we'll show a positive bar
      cumulative += item.value;
      
      return {
        name: item.name,
        value: item.value,
        start: start,
        fill: colors[item.name] || (item.value >= 0 ? '#4CAF50' : '#F44336')
      };
    });
  };
  
  const processedData = processWaterfallData(data.waterfallData);
  
  // Find the maximum value for the y-axis
  const maxValue = Math.max(...processedData.map(item => Math.max(item.start + Math.max(0, item.value), item.start)));
  
  // Custom tooltip to show the values clearly
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: '0', color: data.value < 0 ? '#F44336' : '#4CAF50' }}>
            {`${Math.abs(data.value).toFixed(1)}h ${data.value < 0 ? 'loss' : ''}`}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={processedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          tick={{ fontSize: 10 }}
        />
        <YAxis>
          <Label value="Hours" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        
        {/* Base Value */}
        <Bar 
          dataKey="start" 
          stackId="stack" 
          fill="none" 
          isAnimationActive={false} 
          strokeWidth={0}
        />
        
        {/* Actual Bar Values */}
        <Bar 
          dataKey="value" 
          stackId="stack" 
          fill={(entry) => entry.fill} 
          isAnimationActive={true}
          radius={[0, 0, 0, 0]}
        />
        
        {/* Optional: Add a reference line at 0 */}
        <ReferenceLine y={0} stroke="#000" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default OEEWaterfallChart; 