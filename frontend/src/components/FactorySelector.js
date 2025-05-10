import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';

const FactorySelector = ({
  factories,
  selectedFactory,
  devices,
  selectedDevice,
  onFactoryChange,
  onDeviceChange
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel id="factory-select-label">Factory</InputLabel>
          <Select
            labelId="factory-select-label"
            id="factory-select"
            value={selectedFactory}
            label="Factory"
            onChange={(e) => onFactoryChange(e.target.value)}
          >
            {factories.map((factory) => (
              <MenuItem key={factory.id} value={factory.id}>
                {factory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth disabled={!selectedFactory}>
          <InputLabel id="device-select-label">Device</InputLabel>
          <Select
            labelId="device-select-label"
            id="device-select"
            value={selectedDevice}
            label="Device"
            onChange={(e) => onDeviceChange(e.target.value)}
          >
            {devices.map((device) => (
              <MenuItem key={device.id} value={device.id}>
                {device.type} - {device.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default FactorySelector; 