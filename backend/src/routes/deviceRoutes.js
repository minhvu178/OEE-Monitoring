const express = require('express');
const router = express.Router();
const OEEController = require('../controllers/oeeController');

// Get devices for a factory
router.get('/', OEEController.getDevices);

module.exports = router; 