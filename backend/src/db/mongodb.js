// src/db/mongodb.js
const mongoose = require('mongoose');

/**
 * MongoDB connection manager
 */
class MongoDBConnection {
  constructor(config) {
    this.config = config || {
      host: 'localhost',
      port: 27017,
      database: 'iot_data'
    };
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const { host, port, database, username, password } = this.config;
      
      // Build connection string
      let uri;
      if (username && password) {
        uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
      } else {
        uri = `mongodb://${host}:${port}/${database}`;
      }
      
      // Connect to MongoDB
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log(`Connected to MongoDB at ${host}:${port}/${database}`);
      this.isConnected = true;
      return mongoose.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      this.isConnected = false;
    }
  }
}

module.exports = MongoDBConnection;