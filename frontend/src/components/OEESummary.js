import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';

const OEEMetricCard = ({ title, value, color, suffix = '%' }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Box display="flex" alignItems="center">
        <CircularProgress
          variant="determinate"
          value={value}
          size={60}
          thickness={5}
          sx={{ color }}
        />
        <Typography variant="h4" component="p" ml={2}>
          {value.toFixed(1)}{suffix}
        </Typography>
      </Box>
    </Paper>
  );
};

const OEESummary = ({ data }) => {
  if (!data || !data.metrics) {
    return null;
  }

  const { metrics } = data;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <OEEMetricCard
          title="OEE1"
          value={metrics.oee1}
          color="#00BCD4"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OEEMetricCard
          title="OEE2"
          value={metrics.oee2}
          color="#8BC34A"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OEEMetricCard
          title="OEE3"
          value={metrics.oee3}
          color="#4CAF50"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OEEMetricCard
          title="TCU"
          value={metrics.tcu}
          color="#2196F3"
        />
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Time Distribution (hours)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Total Equipment Time
              </Typography>
              <Typography variant="h6">
                {metrics.totalEquipmentTime.toFixed(1)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Manned Time
              </Typography>
              <Typography variant="h6">
                {metrics.mannedTime.toFixed(1)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Production Time
              </Typography>
              <Typography variant="h6">
                {metrics.productionTime.toFixed(1)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Value Operating Time
              </Typography>
              <Typography variant="h6">
                {metrics.valueOperatingTime.toFixed(1)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OEESummary; 