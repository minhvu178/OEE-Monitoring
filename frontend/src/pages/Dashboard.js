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
  
  // API URL
  const API_URL = 'http://localhost:5000/api';
  
  // Fetch factories on component mount
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const response = await axios.get(`${API_URL}/factories`);
        setFactories(response.data);
        
        // Auto-select first factory if available
        if (response.data.length > 0) {
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
          const response = await axios.get(`${API_URL}/devices?factoryId=${selectedFactory}`);
          setDevices(response.data);
          
          // Auto-select first device if available
          if (response.data.length > 0) {
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
          
          // Fetch OEE waterfall data
          const waterfallResponse = await axios.get(
            `${API_URL}/oee/waterfall?factoryId=${selectedFactory}&deviceId=${selectedDevice}&startDate=${startDate}&endDate=${endDate}`
          );
          setOeeWaterfall(waterfallResponse.data);
          
          // Fetch OEE summary
          const summaryResponse = await axios.get(
            `${API_URL}/oee/summary?factoryId=${selectedFactory}&deviceId=${selectedDevice}&startDate=${startDate}&endDate=${endDate}`
          );
          setOeeSummary(summaryResponse.data);
          
          // Fetch OEE timeline
          const timelineResponse = await axios.get(
            `${API_URL}/oee/timeline?factoryId=${selectedFactory}&deviceId=${selectedDevice}&startDate=${startDate}&endDate=${endDate}&interval=daily`
          );
          setOeeTimeline(timelineResponse.data);
          
          // Fetch stop causes
          const stopsResponse = await axios.get(
            `${API_URL}/oee/stops?factoryId=${selectedFactory}&deviceId=${selectedDevice}&startDate=${startDate}&endDate=${endDate}`
          );
          setStopCauses(stopsResponse.data);
          
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
    setSelectedFactory(factoryId);
    setSelectedDevice('');
  };
  
  const handleDeviceChange = (deviceId) => {
    setSelectedDevice(deviceId);
  };
  
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };
  
  return (
    <div className="dashboard">
      <Box className="dashboard-header" mb={3}>
        <Typography variant="h4" component="h1">
          OEE Monitoring Dashboard
        </Typography>
      </Box>
      
      <Paper className="filters" elevation={2}>
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
          {/* OEE Summary Cards */}
          <Grid item xs={12}>
            <OEESummary data={oeeSummary} />
          </Grid>
          
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