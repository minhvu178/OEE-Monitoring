import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import FactorySelector from '../components/FactorySelector';
import DateRangePicker from '../components/DateRangePicker';
import OEEWaterfallChart from '../components/OEEWaterfallChart';
import OEESummary from '../components/OEESummary';
import OEETimeline from '../components/OEETimeline';
import StopCausesBreakdown from '../components/StopCausesBreakdown';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [factories, setFactories] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    endDate: new Date()
  });
  
  // OEE data states
  const [oeeWaterfall, setOeeWaterfall] = useState(null);
  const [oeeSummary, setOeeSummary] = useState(null);
  const [oeeTimeline, setOeeTimeline] = useState(null);
  const [stopCauses, setStopCauses] = useState(null);
  
  // API URL - use relative URL for browser
  const API_URL = '/api';
  
  // Debug info
  console.log('Factories:', factories);
  
  // Fetch factories on component mount
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        console.log('Fetching factories from:', `${API_URL}/factories`);
        const response = await axios.get(`${API_URL}/factories`);
        console.log('Factories response:', response.data);
        setFactories(response.data);
        
        // Auto-select first factory if available
        if (response.data.length > 0) {
          console.log('Auto-selecting factory:', response.data[0].id);
          setSelectedFactory(response.data[0].id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching factories:', error);
        setLoading(false);
      }
    };
    
    fetchFactories();
  }, []);
  
  // Fetch devices when factory is selected
  useEffect(() => {
    if (selectedFactory) {
      const fetchDevices = async () => {
        try {
          console.log('Fetching devices for factory:', selectedFactory);
          const response = await axios.get(`${API_URL}/devices?factoryId=${selectedFactory}`);
          console.log('Devices response:', response.data);
          setDevices(response.data);
          
          // Auto-select first device if available
          if (response.data.length > 0) {
            console.log('Auto-selecting device:', response.data[0].id);
            setSelectedDevice(response.data[0].id);
          }
        } catch (error) {
          console.error('Error fetching devices:', error);
        }
      };
      
      fetchDevices();
    }
  }, [selectedFactory]);
  
  // Fetch OEE data when factory, device, and date range are selected
  useEffect(() => {
    if (selectedFactory && selectedDevice) {
      const fetchOEEData = async () => {
        setLoading(true);
        
        try {
          // Format dates for API
          const startDate = dateRange.startDate.toISOString();
          const endDate = dateRange.endDate.toISOString();
          
          console.log('Would fetch OEE data with params:', { factoryId: selectedFactory, deviceId: selectedDevice, startDate, endDate });
          
          // Since OEE endpoints aren't implemented, just set loading to false
          setLoading(false);
        } catch (error) {
          console.error('Error fetching OEE data:', error);
          setLoading(false);
        }
      };
      
      fetchOEEData();
    }
  }, [selectedFactory, selectedDevice, dateRange]);
  
  const handleFactoryChange = (factoryId) => {
    console.log('Factory changed to:', factoryId);
    setSelectedFactory(factoryId);
    setSelectedDevice('');
  };
  
  const handleDeviceChange = (deviceId) => {
    console.log('Device changed to:', deviceId);
    setSelectedDevice(deviceId);
  };
  
  const handleDateRangeChange = (newDateRange) => {
    console.log('Date range changed to:', newDateRange);
    setDateRange(newDateRange);
  };
  
  // Debug display component
  const DebugInfo = () => (
    <div style={{ marginTop: '10px', fontSize: '12px', color: 'gray' }}>
      <div><strong>API URL:</strong> {API_URL}</div>
      <div><strong>Factories:</strong> {factories.length > 0 ? factories.map(f => f.id).join(', ') : 'None'}</div>
      <div><strong>Selected Factory:</strong> {selectedFactory || 'None'}</div>
      <div><strong>Devices:</strong> {devices.length > 0 ? devices.map(d => d.id).join(', ') : 'None'}</div>
      <div><strong>Selected Device:</strong> {selectedDevice || 'None'}</div>
    </div>
  );
  
  return (
    <div className="dashboard">
      <Box className="dashboard-header" mb={3}>
        <Typography variant="h4" component="h1">
          OEE Monitoring Dashboard
        </Typography>
        <DebugInfo />
      </Box>
      
      <Paper className="filters" elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FactorySelector 
              factories={factories}
              selectedFactory={selectedFactory}
              devices={devices}
              selectedDevice={selectedDevice}
              onFactoryChange={handleFactoryChange}
              onDeviceChange={handleDeviceChange}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <DateRangePicker 
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} mt={1}>
          {/* OEE Summary Cards - only render if data is available */}
          {oeeSummary && (
            <Grid item xs={12}>
              <OEESummary data={oeeSummary} />
            </Grid>
          )}
          
          {/* OEE Waterfall Chart */}
          <Grid item xs={12} md={8}>
            <Paper className="chart-container">
              <Typography variant="h6" component="h2" gutterBottom>
                OEE Waterfall
              </Typography>
              <OEEWaterfallChart data={oeeWaterfall} />
            </Paper>
          </Grid>
          
          {/* Stop Causes Breakdown */}
          <Grid item xs={12} md={4}>
            <Paper className="chart-container">
              <Typography variant="h6" component="h2" gutterBottom>
                Stop Causes
              </Typography>
              <StopCausesBreakdown data={stopCauses} />
            </Paper>
          </Grid>
          
          {/* OEE Timeline */}
          <Grid item xs={12}>
            <Paper className="chart-container">
              <Typography variant="h6" component="h2" gutterBottom>
                OEE Metrics Over Time
              </Typography>
              <OEETimeline data={oeeTimeline} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default Dashboard;
