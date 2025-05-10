const mongoose = require('mongoose');

// Define models for IoT data
const SensorData = mongoose.model('sensor_data', new mongoose.Schema({}, { strict: false }));
const MachineStatus = mongoose.model('machine_status', new mongoose.Schema({}, { strict: false }));

// OEE Controller
const OEEController = {

  // Get OEE summary metrics
  getOEESummary: async (req, res) => {
    try {
      const { factoryId, deviceId, startDate, endDate } = req.query;
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Calculate total equipment time (in hours)
      const totalEquipmentTime = (end - start) / (1000 * 60 * 60);
      
      // Get machine status data to calculate operating times
      const statusData = await MachineStatus.find({
        'metadata.factoryId': factoryId,
        'metadata.deviceId': deviceId,
        timestamp: { $gte: start, $lte: end }
      }).sort({ timestamp: 1 });
      
      // Calculate different operating times
      const { 
        valueOperatingTime, 
        operatingTime, 
        productionTime, 
        mannedTime 
      } = calculateOperatingTimes(statusData, totalEquipmentTime);
      
      // Calculate OEE metrics
      const oee1 = valueOperatingTime / operatingTime;
      const oee2 = valueOperatingTime / productionTime;
      const oee3 = valueOperatingTime / mannedTime;
      const tcu = valueOperatingTime / totalEquipmentTime;
      
      res.json({
        factoryId,
        deviceId,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          totalHours: totalEquipmentTime
        },
        metrics: {
          valueOperatingTime,
          operatingTime,
          productionTime,
          mannedTime,
          totalEquipmentTime,
          oee1: oee1 * 100,
          oee2: oee2 * 100,
          oee3: oee3 * 100,
          tcu: tcu * 100
        }
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
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Calculate total equipment time (in hours)
      const totalEquipmentTime = (end - start) / (1000 * 60 * 60);
      
      // Get machine status data
      const statusData = await MachineStatus.find({
        'metadata.factoryId': factoryId,
        'metadata.deviceId': deviceId,
        timestamp: { $gte: start, $lte: end }
      }).sort({ timestamp: 1 });
      
      // Get stop causes and durations
      const stopData = calculateStopCauses(statusData);
      
      // Calculate operating times and losses
      const { 
        valueOperatingTime, 
        operatingTime, 
        productionTime, 
        mannedTime,
        losses 
      } = calculateOperatingTimes(statusData, totalEquipmentTime, stopData);
      
      // Prepare waterfall data
      const waterfallData = [
        { name: 'Total Equipment Time', value: totalEquipmentTime },
        { name: 'Non-Production', value: -losses.nonProduction },
        { name: 'Manned Time', value: mannedTime },
        { name: 'Batch Specific', value: -losses.batchSpecific },
        { name: 'Production Time', value: productionTime },
        { name: 'Loss During Operation', value: -losses.duringOperation },
        { name: 'Operating Time', value: operatingTime },
        { name: 'Valued Operating Time', value: valueOperatingTime }
      ];
      
      res.json({
        factoryId,
        deviceId,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        waterfallData,
        metrics: {
          oee1: (valueOperatingTime / operatingTime) * 100,
          oee2: (valueOperatingTime / productionTime) * 100,
          oee3: (valueOperatingTime / mannedTime) * 100,
          tcu: (valueOperatingTime / totalEquipmentTime) * 100
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
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Define time intervals (hourly, daily, weekly)
      const timeInterval = interval || 'daily';
      
      // Calculate time periods based on interval
      const timePeriods = calculateTimePeriods(start, end, timeInterval);
      
      // Calculate OEE for each time period
      const timelineData = [];
      
      for (const period of timePeriods) {
        const statusData = await MachineStatus.find({
          'metadata.factoryId': factoryId,
          'metadata.deviceId': deviceId,
          timestamp: { $gte: period.start, $lte: period.end }
        }).sort({ timestamp: 1 });
        
        const totalPeriodTime = (period.end - period.start) / (1000 * 60 * 60);
        
        const { 
          valueOperatingTime, 
          operatingTime, 
          productionTime, 
          mannedTime 
        } = calculateOperatingTimes(statusData, totalPeriodTime);
        
        timelineData.push({
          timestamp: period.start.toISOString(),
          oee1: operatingTime > 0 ? (valueOperatingTime / operatingTime) * 100 : 0,
          oee2: productionTime > 0 ? (valueOperatingTime / productionTime) * 100 : 0,
          oee3: mannedTime > 0 ? (valueOperatingTime / mannedTime) * 100 : 0,
          tcu: totalPeriodTime > 0 ? (valueOperatingTime / totalPeriodTime) * 100 : 0
        });
      }
      
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
      
      // Convert date strings to Date objects
      const start = new Date(startDate || '2023-01-01');
      const end = new Date(endDate || new Date());
      
      // Get machine status data
      const statusData = await MachineStatus.find({
        'metadata.factoryId': factoryId,
        'metadata.deviceId': deviceId,
        timestamp: { $gte: start, $lte: end }
      }).sort({ timestamp: 1 });
      
      // Calculate stop causes and durations
      const stopCauses = calculateStopCauses(statusData);
      
      // Group stops by category
      const stopsByCategory = {
        lossDuringOperation: [],
        batchSpecific: [],
        nonProduction: []
      };
      
      // Categorize stops
      for (const stop of stopCauses) {
        if (['ERROR', 'IDLE'].includes(stop.status)) {
          stopsByCategory.lossDuringOperation.push(stop);
        } else if (['SETUP', 'MAINTENANCE'].includes(stop.status)) {
          stopsByCategory.batchSpecific.push(stop);
        } else if (['STOPPED'].includes(stop.status)) {
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

// Helper function to calculate operating times
function calculateOperatingTimes(statusData, totalEquipmentTime, stopData = null) {
  // Default values
  let valueOperatingTime = 0;
  let operatingTime = 0;
  let productionTime = 0;
  let mannedTime = 0;
  
  // Calculate losses
  const losses = {
    duringOperation: 0,
    batchSpecific: 0,
    nonProduction: 0
  };
  
  // If no status data, return zeros
  if (!statusData || statusData.length === 0) {
    return { valueOperatingTime, operatingTime, productionTime, mannedTime, losses };
  }
  
  // Process status data to calculate operating times
  let lastTimestamp = null;
  let lastStatus = null;
  
  // For this example, let's simulate some realistic values
  // In a real implementation, we would calculate these from actual data
  valueOperatingTime = totalEquipmentTime * 0.5; // 50% of total time is valuable
  operatingTime = totalEquipmentTime * 0.8;      // 80% of time is operating
  productionTime = totalEquipmentTime * 0.85;    // 85% of time is production
  mannedTime = totalEquipmentTime * 0.9;         // 90% of time is manned
  
  // Calculate losses
  losses.duringOperation = operatingTime - valueOperatingTime;
  losses.batchSpecific = productionTime - operatingTime;
  losses.nonProduction = mannedTime - productionTime;
  
  return {
    valueOperatingTime,
    operatingTime,
    productionTime,
    mannedTime,
    losses
  };
}

// Helper function to calculate stop causes
function calculateStopCauses(statusData) {
  const stopCauses = [];
  
  // If no status data, return empty array
  if (!statusData || statusData.length === 0) {
    return stopCauses;
  }
  
  // Process status data to find stops
  let lastTimestamp = null;
  let lastStatus = null;
  
  for (const status of statusData) {
    if (lastTimestamp && lastStatus && lastStatus !== 'RUNNING') {
      // Calculate duration in hours
      const duration = (new Date(status.timestamp) - new Date(lastTimestamp)) / (1000 * 60 * 60);
      
      stopCauses.push({
        startTime: lastTimestamp,
        endTime: status.timestamp,
        duration,
        status: lastStatus,
        category: categorizeStop(lastStatus)
      });
    }
    
    lastTimestamp = status.timestamp;
    lastStatus = status.status;
  }
  
  return stopCauses;
}

// Helper function to categorize stops
function categorizeStop(status) {
  if (['ERROR', 'IDLE'].includes(status)) {
    return 'Loss During Operation';
  } else if (['SETUP', 'MAINTENANCE'].includes(status)) {
    return 'Batch Specific Non-Operation';
  } else if (['STOPPED'].includes(status)) {
    return 'Non-Production Activities';
  }
  return 'Unknown';
}

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