const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const oeeRoutes = require('./routes/oeeRoutes');
const factoryRoutes = require('./routes/factoryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/iot_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/oee', oeeRoutes);
app.use('/api/factories', factoryRoutes);
app.use('/api/devices', deviceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 