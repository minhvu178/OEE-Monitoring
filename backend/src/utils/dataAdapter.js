const mongoose = require('mongoose');

/**
 * Adapter for Flexible-IoT-Generator data model
 * Maps the IoT generator data to our OEE calculation model
 */
class IoTDataAdapter {
  constructor(db) {
    this.db = db;
    
    // Single collection model for all data types
    this.SensorData = mongoose.model('SensorData', new mongoose.Schema({}, { 
      strict: false,
      collection: 'sensor_data'
    }));
  }
  
  /**
   * Get all factories from the database
   */
  async getFactories() {
    try {
      // Use aggregation to get unique factory IDs and names
      const factories = await this.SensorData.aggregate([
        { $group: { _id: "$metadata.factoryId", name: { $first: "$metadata.factoryName" } } },
        { $project: { id: "$_id", name: 1, _id: 0 } }
      ]);
      
      // If factory names are not available in the data, use IDs as names
      return factories.map(factory => ({
        id: factory.id,
        name: factory.name || `Factory ${factory.id}`
      }));
    } catch (error) {
      console.error('Error fetching factories:', error);
      return [];
    }
  }
  
  /**
   * Get all devices for a specific factory
   */
  async getDevicesForFactory(factoryId) {
    try {
      // Use aggregation to get unique device IDs, types, and names for the factory
      const devices = await this.SensorData.aggregate([
        { $match: { "metadata.factoryId": factoryId } },
        { $group: { 
          _id: "$metadata.deviceId", 
          type: { $first: "$metadata.deviceType" } 
        }},
        { $project: { id: "$_id", type: 1, _id: 0 } }
      ]);
      
      return devices;
    } catch (error) {
      console.error(`Error fetching devices for factory ${factoryId}:`, error);
      return [];
    }
  }
  
  /**
   * Get machine status data for a device in a time range
   */
  async getMachineStatusData(factoryId, deviceId, startDate, endDate) {
    try {
      return await this.SensorData.find({
        "metadata.factoryId": factoryId,
        "metadata.deviceId": deviceId,
        "metadata.type": "machine_status", // Filter by type instead of collection
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).sort({ timestamp: 1 });
    } catch (error) {
      console.error(`Error fetching machine status for device ${deviceId}:`, error);
      return [];
    }
  }
  
  /**
   * Get production data for a device in a time range
   */
  async getProductionData(factoryId, deviceId, startDate, endDate) {
    try {
      return await this.SensorData.find({
        "metadata.factoryId": factoryId,
        "metadata.deviceId": deviceId,
        "metadata.type": "production", // Filter by type instead of collection
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).sort({ timestamp: 1 });
    } catch (error) {
      console.error(`Error fetching production data for device ${deviceId}:`, error);
      return [];
    }
  }
  
  /**
   * Get quality data for a device in a time range
   */
  async getQualityData(factoryId, deviceId, startDate, endDate) {
    try {
      return await this.SensorData.find({
        "metadata.factoryId": factoryId,
        "metadata.deviceId": deviceId,
        "metadata.type": "quality_check", // Filter by type instead of collection
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).sort({ timestamp: 1 });
    } catch (error) {
      console.error(`Error fetching quality data for device ${deviceId}:`, error);
      return [];
    }
  }
  
  /**
   * Get sensor data for a device in a time range
   */
  async getSensorData(factoryId, deviceId, sensorId, startDate, endDate) {
    try {
      const query = {
        "metadata.factoryId": factoryId,
        "metadata.deviceId": deviceId,
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
      };
      
      if (sensorId) {
        query["metadata.sensorId"] = sensorId;
      }
      
      return await this.SensorData.find(query).sort({ timestamp: 1 });
    } catch (error) {
      console.error(`Error fetching sensor data for device ${deviceId}:`, error);
      return [];
    }
  }
}

module.exports = IoTDataAdapter; 