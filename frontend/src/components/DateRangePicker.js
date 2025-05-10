import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Grid, Typography } from '@mui/material';

const DateRangePicker = ({ dateRange, onDateRangeChange }) => {
  const handleStartDateChange = (newDate) => {
    onDateRangeChange({
      ...dateRange,
      startDate: newDate
    });
  };

  const handleEndDateChange = (newDate) => {
    onDateRangeChange({
      ...dateRange,
      endDate: newDate
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Typography variant="body1">Time Period:</Typography>
        </Grid>
        <Grid item>
          <DatePicker
            label="Start Date"
            value={dateRange.startDate}
            onChange={handleStartDateChange}
            maxDate={dateRange.endDate}
          />
        </Grid>
        <Grid item>
          <Typography variant="body1">to</Typography>
        </Grid>
        <Grid item>
          <DatePicker
            label="End Date"
            value={dateRange.endDate}
            onChange={handleEndDateChange}
            minDate={dateRange.startDate}
            maxDate={new Date()}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default DateRangePicker; 