import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Paper, Typography } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="subtitle2">{label}</Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {`${entry.name}: ${entry.value.toFixed(1)}%`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const OEETimeline = ({ data }) => {
  if (!data || !data.timeline || data.timeline.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No timeline data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        OEE Timeline
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data.timeline}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="oee1"
            name="OEE1"
            stroke="#00BCD4"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="oee2"
            name="OEE2"
            stroke="#8BC34A"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="oee3"
            name="OEE3"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="tcu"
            name="TCU"
            stroke="#2196F3"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default OEETimeline; 