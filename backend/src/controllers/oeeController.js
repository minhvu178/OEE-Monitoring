const IoTDataAdapter = require('../utils/dataAdapter');
const OEECalculator = require('../utils/oeeCalculator');

// Initialize data adapter
const dataAdapter = new IoTDataAdapter();

/**
 * Helper function to calculate time periods based on interval
 */
function calculateTimePeriods(start, end, interval) {
  const periods = [];
  let current = new Date(start);
  
  while (current < end) {
    const periodStart = new Date(current);
    let periodEnd;
    
    switch (interval) {
      case 'hourly':
        periodEnd = new Date(current.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        periodEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        periodEnd = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
    
    // Ensure period end doesn't exceed the overall end date
    if (periodEnd > end) {
      periodEnd = end;
    }
    
    periods.push({
      start: periodStart,
      end: periodEnd
    });
    
    current = periodEnd;
  }
  
  return periods;
}

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
      
      // Define time interval (hourly, daily, weekly)
      const timeInterval = interval || 'daily';
      
      // Get machine status data
      const machineStatusData = await dataAdapter.getMachineStatusData(factoryId, deviceId, start, end);
      
      // Get production data
      const productionData = await dataAdapter.getProductionData(factoryId, deviceId, start, end);
      
      // Get quality data
      const qualityData = await dataAdapter.getQualityData(factoryId, deviceId, start, end);
      
      // Calculate time periods based on interval
      const periods = calculateTimePeriods(start, end, timeInterval);
      
      // Calculate OEE timeline data
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
        timeline: timelineData
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
      
      // Calculate stop causes
      const stopCauses = OEECalculator.calculateStopCauses(machineStatusData);
      
      res.json({
        factoryId,
        deviceId,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        stopCauses
      });
    } catch (error) {
      console.error('Error fetching stop causes:', error);
      res.status(500).json({ error: 'Failed to fetch stop causes' });
    }
  }
};

module.exports = OEEController; 