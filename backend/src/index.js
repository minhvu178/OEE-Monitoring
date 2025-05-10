const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const MongoDBConnection = require('./db/mongodb');
const factoryRoutes = require('./routes/factoryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize MongoDB connection
const dbConfig = {
  host: process.env.MONGODB_HOST || 'localhost',
  port: process.env.MONGODB_PORT || 27017,
  database: process.env.MONGODB_DATABASE || 'iot_data',
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD
};

const dbConnection = new MongoDBConnection(dbConfig);

// Connect to MongoDB
dbConnection.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/factories', factoryRoutes);
app.use('/api/devices', deviceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
