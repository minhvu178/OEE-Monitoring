import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const COLORS = [
  '#FF5252', // Red
  '#FF9800', // Orange
  '#FFC107', // Amber
  '#FFEB3B', // Yellow
  '#CDDC39', // Lime
  '#8BC34A', // Light Green
  '#4CAF50', // Green
  '#009688', // Teal
  '#00BCD4', // Cyan
  '#03A9F4', // Light Blue
  '#2196F3', // Blue
  '#3F51B5', // Indigo
  '#673AB7', // Deep Purple
  '#9C27B0', // Purple
  '#E91E63', // Pink
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="subtitle2">{data.name}</Typography>
        <Typography variant="body2">
          {`Duration: ${data.value.toFixed(1)} hours`}
        </Typography>
        <Typography variant="body2">
          {`Percentage: ${data.percentage.toFixed(1)}%`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const StopCausesBreakdown = ({ data }) => {
  if (!data || !data.stopCauses || data.stopCauses.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No stop causes data available
        </Typography>
      </Paper>
    );
  }

  // Calculate total duration for percentage
  const totalDuration = data.stopCauses.reduce((sum, cause) => sum + cause.value, 0);
  
  // Add percentage to each cause
  const chartData = data.stopCauses.map(cause => ({
    ...cause,
    percentage: (cause.value / totalDuration) * 100
  }));

  return (
    <Paper elevation={2} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Stop Causes Breakdown
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, percentage }) => 
                `${name} (${percentage.toFixed(1)}%)`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default StopCausesBreakdown; 