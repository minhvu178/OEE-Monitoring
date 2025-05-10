const IoTDataAdapter = require('../utils/dataAdapter');
const OEECalculator = require('../utils/oeeCalculator');

// Initialize data adapter
const dataAdapter = new IoTDataAdapter();

// OEE Controller
const OEEController = {
  // Get factories
  getFactories: async (req, res) => {
    try {
      const factories = await dataAdapter.getFactories();
      res.json(factories);
    } catch (error) {
      console.error('Error fetching factories:', error);
      res.status(500).json({ error: 'Failed to fetch factories' });
    }
  },
  
  // Get devices for a factory
  getDevices: async (req, res) => {
    try {
      const { factoryId } = req.query;
      
      if (!factoryId) {
        return res.status(400).json({ error: 'Factory ID is required' });
      }
      
      const devices = await dataAdapter.getDevicesForFactory(factoryId);
      res.json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  },

  // Get OEE summary metrics
  getOEESummary: async (req, res) => {
    try {
      const { factoryId, deviceId, startDate, endDate } = req.query;
      
      if (!factoryId || !deviceId) {
        return res.status(400).json({ error: 'Factory ID and Device ID are required' });
      }
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Calculate total equipment time (in hours)
      const totalEquipmentTime = (end - start) / (1000 * 60 * 60);
      
      // Get machine status data
      const machineStatusData = await dataAdapter.getMachineStatusData(factoryId, deviceId, start, end);
      
      // Get production data
      const productionData = await dataAdapter.getProductionData(factoryId, deviceId, start, end);
      
      // Get quality data
      const qualityData = await dataAdapter.getQualityData(factoryId, deviceId, start, end);
      
      // Calculate OEE metrics
      const metrics = OEECalculator.calculateOEEMetrics(
        machineStatusData,
        productionData,
        qualityData,
        totalEquipmentTime
      );
      
      res.json({
        factoryId,
        deviceId,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          totalHours: totalEquipmentTime
        },
        metrics
      });
    } catch (error) {
      console.error('Error calculating OEE summary:', error);
      res.status(500).json({ error: 'Failed to calculate OEE summary' });
    }
  },

  // Get OEE waterfall data for chart
  getOEEWaterfall: async (req, res) => {
    try {
      const { factoryId, deviceId, startDate, endDate } = req.query;
      
      if (!factoryId || !deviceId) {
        return res.status(400).json({ error: 'Factory ID and Device ID are required' });
      }
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Calculate total equipment time (in hours)
      const totalEquipmentTime = (end - start) / (1000 * 60 * 60);
      
      // Get machine status data
      const machineStatusData = await dataAdapter.getMachineStatusData(factoryId, deviceId, start, end);
      
      // Get production data
      const productionData = await dataAdapter.getProductionData(factoryId, deviceId, start, end);
      
      // Get quality data
      const qualityData = await dataAdapter.getQualityData(factoryId, deviceId, start, end);
      
      // Calculate OEE metrics
      const metrics = OEECalculator.calculateOEEMetrics(
        machineStatusData,
        productionData,
        qualityData,
        totalEquipmentTime
      );
      
      // Calculate waterfall data
      const waterfallData = OEECalculator.calculateWaterfallData(metrics);
      
      // Get stop causes
      const stopCauses = OEECalculator.calculateStopCauses(machineStatusData);
      
      res.json({
        factoryId,
        deviceId,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        waterfallData,
        metrics: {
          oee1: metrics.oee1,
          oee2: metrics.oee2,
          oee3: metrics.oee3,
          tcu: metrics.tcu
        }
      });
    } catch (error) {
      console.error('Error calculating OEE waterfall:', error);
      res.status(500).json({ error: 'Failed to calculate OEE waterfall' });
    }
  },

  // Get OEE metrics over time (timeline)
  getOEETimeline: async (req, res) => {
    try {
      const { factoryId, deviceId, startDate, endDate, interval } = req.query;
      
      if (!factoryId || !deviceId) {
        return res.status(400).json({ error: 'Factory ID and Device ID are required' });
      }
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Define time intervals (hourly, daily, weekly)
      const timeInterval = interval || 'daily';
      
      // Get machine status data
      const machineStatusData = await dataAdapter.getMachineStatusData(factoryId, deviceId, start, end);
      
      // Get production data
      const productionData = await dataAdapter.getProductionData(factoryId, deviceId, start, end);
      
      // Get quality data
      const qualityData = await dataAdapter.getQualityData(factoryId, deviceId, start, end);
      
      // Calculate time periods based on interval
      const periods = calculateTimePeriods(start, end, timeInterval);
      
      // Calculate OEE for each time period
      const timelineData = OEECalculator.calculateTimelineMetrics(
        machineStatusData,
        productionData,
        qualityData,
        periods
      );
      
      res.json({
        factoryId,
        deviceId,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          interval: timeInterval
        },
        timelineData
      });
    } catch (error) {
      console.error('Error calculating OEE timeline:', error);
      res.status(500).json({ error: 'Failed to calculate OEE timeline' });
    }
  },

  // Get stop causes and durations
  getStopCauses: async (req, res) => {
    try {
      const { factoryId, deviceId, startDate, endDate } = req.query;
      
      if (!factoryId || !deviceId) {
        return res.status(400).json({ error: 'Factory ID and Device ID are required' });
      }
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Get machine status data
      const machineStatusData = await dataAdapter.getMachineStatusData(factoryId, deviceId, start, end);
      
      // Calculate stop causes and durations
      const stopCauses = OEECalculator.calculateStopCauses(machineStatusData);
      
      // Group stops by category
      const categories = ['Loss During Operation', 'Batch Specific Non-Operation', 'Non-Production Activities'];
      const stopsByCategory = {
        lossDuringOperation: [],
        batchSpecific: [],
        nonProduction: []
      };
      
      // Categorize stops
      for (const stop of stopCauses) {
        if (stop.category === 'Loss During Operation') {
          stopsByCategory.lossDuringOperation.push(stop);
        } else if (stop.category === 'Batch Specific Non-Operation') {
          stopsByCategory.batchSpecific.push(stop);
        } else if (stop.category === 'Non-Production Activities') {
          stopsByCategory.nonProduction.push(stop);
        }
      }
      
      res.json({
        factoryId,
        deviceId,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        stopsByCategory
      });
    } catch (error) {
      console.error('Error fetching stop causes:', error);
      res.status(500).json({ error: 'Failed to fetch stop causes' });
    }
  }
};

// Helper function to calculate time periods for timeline
function calculateTimePeriods(start, end, interval) {
  const periods = [];
  let currentStart = new Date(start);
  
  while (currentStart < end) {
    let currentEnd;
    
    switch (interval) {
      case 'hourly':
        currentEnd = new Date(currentStart);
        currentEnd.setHours(currentEnd.getHours() + 1);
        break;
      case 'daily':
        currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + 1);
        break;
      case 'weekly':
        currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + 7);
        break;
      default:
        currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + 1);
    }
    
    // Ensure we don't go past the end date
    if (currentEnd > end) {
      currentEnd = new Date(end);
    }
    
    periods.push({
      start: new Date(currentStart),
      end: new Date(currentEnd)
    });
    
    currentStart = new Date(currentEnd);
  }
  
  return periods;
}

module.exports = OEEController; 