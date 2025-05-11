/**
 * Utility class for OEE calculations
 */
class OEECalculator {
  /**
   * Calculate OEE metrics based on machine status, production, and quality data
   */
  static calculateOEEMetrics(machineStatusData, productionData, qualityData, totalEquipmentTime) {
    // Default values
    const metrics = {
      valueOperatingTime: 0,
      operatingTime: 0,
      productionTime: 0,
      mannedTime: 0,
      totalEquipmentTime,
      oee1: 0,
      oee2: 0,
      oee3: 0,
      tcu: 0
    };
    
    // Process machine status data to calculate times
    if (machineStatusData && machineStatusData.length > 0) {
      let runningTime = 0;
      let setupTime = 0;
      let maintenanceTime = 0;
      let stoppedTime = 0;
      let idleTime = 0;
      let errorTime = 0;
      
      // Calculate time spent in each status
      for (let i = 0; i < machineStatusData.length - 1; i++) {
        const current = machineStatusData[i];
        const next = machineStatusData[i + 1];
        
        // Calculate time difference in hours
        const duration = (new Date(next.timestamp) - new Date(current.timestamp)) / (1000 * 60 * 60);
        
        switch (current.status) {
          case 'running':
            runningTime += duration;
            break;
          case 'setup':
            setupTime += duration;
            break;
          case 'maintenance':
            maintenanceTime += duration;
            break;
          case 'stopped':
            stoppedTime += duration;
            break;
          case 'idle':
            idleTime += duration;
            break;
          case 'error':
            errorTime += duration;
            break;
        }
      }
      
      // Calculate OEE components
      // Operating time = running + idle + error time
      metrics.operatingTime = runningTime + idleTime + errorTime;
      
      // Production time = operating + setup time
      metrics.productionTime = metrics.operatingTime + setupTime;
      
      // Manned time = production + maintenance time
      metrics.mannedTime = metrics.productionTime + maintenanceTime;
      
      // Value operating time is derived from production data
      if (productionData && productionData.length > 0) {
        // Sum total production count
        const totalProduction = productionData.reduce((sum, item) => sum + (item.interval_count || 0), 0);
        
        // Calculate value operating time based on production efficiency
        // This is a simplification - in a real system, you'd use actual production rates
        const avgEfficiency = productionData.reduce((sum, item) => sum + (item.efficiency || 0), 0) / productionData.length;
        metrics.valueOperatingTime = runningTime * (avgEfficiency / 100);
      } else {
        // If no production data, estimate value operating time
        metrics.valueOperatingTime = runningTime * 0.8; // Assume 80% efficiency
      }
      
      // Adjust using quality data if available
      if (qualityData && qualityData.length > 0) {
        // Calculate average defect rate
        const avgDefectRate = qualityData.reduce((sum, item) => sum + (item.defect_rate || 0), 0) / qualityData.length;
        
        // Adjust value operating time by quality
        metrics.valueOperatingTime *= (1 - avgDefectRate);
      }
      
      // Calculate OEE metrics
      metrics.oee1 = metrics.operatingTime > 0 ? (metrics.valueOperatingTime / metrics.operatingTime) * 100 : 0;
      metrics.oee2 = metrics.productionTime > 0 ? (metrics.valueOperatingTime / metrics.productionTime) * 100 : 0;
      metrics.oee3 = metrics.mannedTime > 0 ? (metrics.valueOperatingTime / metrics.mannedTime) * 100 : 0;
      metrics.tcu = metrics.totalEquipmentTime > 0 ? (metrics.valueOperatingTime / metrics.totalEquipmentTime) * 100 : 0;
    } else {
      // If no machine status data is available, use simulated data for demo purposes
      // This can be removed in a production environment
      metrics.valueOperatingTime = totalEquipmentTime * 0.5; // 50% of total time
      metrics.operatingTime = totalEquipmentTime * 0.7;      // 70% of total time
      metrics.productionTime = totalEquipmentTime * 0.8;     // 80% of total time
      metrics.mannedTime = totalEquipmentTime * 0.9;         // 90% of total time
      
      metrics.oee1 = 71.4; // (0.5/0.7) * 100
      metrics.oee2 = 62.5; // (0.5/0.8) * 100
      metrics.oee3 = 55.6; // (0.5/0.9) * 100
      metrics.tcu = 50.0;  // (0.5/1.0) * 100
    }
    
    return metrics;
  }
  
  /**
   * Calculate stop causes and durations from machine status data
   */
  static calculateStopCauses(machineStatusData) {
    const stopCauses = [];
    
    if (!machineStatusData || machineStatusData.length < 2) {
      // Return some sample data for demonstration if no data exists
      return [
        { name: "Equipment Failure", value: 2.5, category: "Loss During Operation" },
        { name: "Material Shortage", value: 1.8, category: "Loss During Operation" },
        { name: "Changeover", value: 3.2, category: "Batch Specific Non-Operation" },
        { name: "Planned Maintenance", value: 4.0, category: "Non-Production Activities" }
      ];
    }
    
    // Process status data to find stops
    let currentStop = null;
    
    for (let i = 0; i < machineStatusData.length - 1; i++) {
      const current = machineStatusData[i];
      const next = machineStatusData[i + 1];
      
      // If status is not 'running', it's a stop
      if (current.status !== 'running') {
        // Calculate duration in hours
        const duration = (new Date(next.timestamp) - new Date(current.timestamp)) / (1000 * 60 * 60);
        
        // If this is a continuation of the previous stop with same status
        if (currentStop && currentStop.status === current.status) {
          // Update end time and duration
          currentStop.endTime = next.timestamp;
          currentStop.duration += duration;
        } else {
          // Create new stop
          currentStop = {
            startTime: current.timestamp,
            endTime: next.timestamp,
            duration,
            status: current.status,
            category: categorizeStop(current.status)
          };
          
          stopCauses.push(currentStop);
        }
      } else {
        // Reset current stop when running
        currentStop = null;
      }
    }
    
    // Convert the stop causes to the format expected by the frontend
    return stopCauses.map(stop => ({
      name: getStopName(stop.status),
      value: stop.duration,
      category: stop.category
    }));
  }
  
  /**
   * Calculate OEE metrics over time
   */
  static calculateTimelineMetrics(machineStatusData, productionData, qualityData, periods) {
    const timelineData = [];
    
    if (!periods || periods.length === 0) {
      // Return some sample timeline data if no periods
      const now = new Date();
      return [
        { timestamp: new Date(now.getTime() - 6 * 86400000).toISOString(), oee1: 65, oee2: 60, oee3: 55, tcu: 45 },
        { timestamp: new Date(now.getTime() - 5 * 86400000).toISOString(), oee1: 68, oee2: 62, oee3: 57, tcu: 47 },
        { timestamp: new Date(now.getTime() - 4 * 86400000).toISOString(), oee1: 70, oee2: 65, oee3: 60, tcu: 50 },
        { timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(), oee1: 72, oee2: 67, oee3: 62, tcu: 52 },
        { timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(), oee1: 75, oee2: 70, oee3: 65, tcu: 55 },
        { timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(), oee1: 73, oee2: 68, oee3: 63, tcu: 53 },
        { timestamp: now.toISOString(), oee1: 71, oee2: 66, oee3: 61, tcu: 51 }
      ];
    }
    
    for (const period of periods) {
      // Filter data for this period
      const periodStatusData = machineStatusData.filter(item => 
        new Date(item.timestamp) >= period.start && new Date(item.timestamp) <= period.end
      );
      
      const periodProductionData = productionData.filter(item => 
        new Date(item.timestamp) >= period.start && new Date(item.timestamp) <= period.end
      );
      
      const periodQualityData = qualityData.filter(item => 
        new Date(item.timestamp) >= period.start && new Date(item.timestamp) <= period.end
      );
      
      // Calculate total period time in hours
      const totalPeriodTime = (period.end - period.start) / (1000 * 60 * 60);
      
      // Calculate OEE metrics for this period
      const metrics = this.calculateOEEMetrics(
        periodStatusData,
        periodProductionData,
        periodQualityData,
        totalPeriodTime
      );
      
      timelineData.push({
        timestamp: period.start.toISOString(),
        oee1: metrics.oee1,
        oee2: metrics.oee2,
        oee3: metrics.oee3,
        tcu: metrics.tcu
      });
    }
    
    return timelineData;
  }
  
  /**
   * Calculate OEE waterfall data for chart
   */
  static calculateWaterfallData(metrics) {
    // Calculate losses
    const nonProduction = metrics.totalEquipmentTime - metrics.mannedTime;
    const batchSpecific = metrics.mannedTime - metrics.productionTime;
    const lossDuringOperation = metrics.productionTime - metrics.operatingTime;
    const operatingLoss = metrics.operatingTime - metrics.valueOperatingTime;
    
    // Prepare waterfall data
    return [
      { name: 'Total Equipment Time', value: metrics.totalEquipmentTime },
      { name: 'Non-Production', value: -nonProduction },
      { name: 'Manned Time', value: metrics.mannedTime },
      { name: 'Batch Specific', value: -batchSpecific },
      { name: 'Production Time', value: metrics.productionTime },
      { name: 'Loss During Operation', value: -lossDuringOperation },
      { name: 'Operating Time', value: metrics.operatingTime },
      { name: 'Operating Loss', value: -operatingLoss },
      { name: 'Valued Operating Time', value: metrics.valueOperatingTime }
    ];
  }
}

/**
 * Helper function to categorize stops
 */
function categorizeStop(status) {
  switch (status) {
    case 'error':
    case 'idle':
      return 'Loss During Operation';
    case 'setup':
    case 'maintenance':
      return 'Batch Specific Non-Operation';
    case 'stopped':
      return 'Non-Production Activities';
    default:
      return 'Unknown';
  }
}

/**
 * Helper function to get a human-readable name for a stop status
 */
function getStopName(status) {
  switch (status) {
    case 'error':
      return 'Equipment Failure';
    case 'idle':
      return 'Idle Time';
    case 'setup':
      return 'Setup/Changeover';
    case 'maintenance':
      return 'Planned Maintenance';
    case 'stopped':
      return 'Planned Downtime';
    default:
      return 'Other';
  }
}

module.exports = OEECalculator; 