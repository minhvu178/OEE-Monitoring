import React from 'react';
import { Box, TextField, Button, Grid, Typography } from '@mui/material';

const DateRangePicker = ({ dateRange, onDateRangeChange }) => {
  const handleStartDateChange = (event) => {
    onDateRangeChange({
      ...dateRange,
      startDate: new Date(event.target.value)
    });
  };

  const handleEndDateChange = (event) => {
    onDateRangeChange({
      ...dateRange,
      endDate: new Date(event.target.value)
    });
  };

  // Set quick date ranges
  const setLastWeek = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    onDateRangeChange({ startDate: start, endDate: end });
  };

  const setLastMonth = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 1);
    onDateRangeChange({ startDate: start, endDate: end });
  };

  // Format date for input
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Typography variant="body1">Time Period:</Typography>
        </Grid>
        <Grid item>
          <TextField
            label="Start Date"
            type="date"
            value={formatDate(dateRange.startDate)}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item>
          <Typography variant="body1">to</Typography>
        </Grid>
        <Grid item>
          <TextField
            label="End Date"
            type="date"
            value={formatDate(dateRange.endDate)}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item>
          <Button size="small" variant="outlined" onClick={setLastWeek}>Last 7 Days</Button>
        </Grid>
        <Grid item>
          <Button size="small" variant="outlined" onClick={setLastMonth}>Last 30 Days</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DateRangePicker;
