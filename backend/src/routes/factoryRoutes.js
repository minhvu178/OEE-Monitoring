const express = require('express');
const router = express.Router();
const OEEController = require('../controllers/oeeController');

// Get all factories
router.get('/', OEEController.getFactories);

module.exports = router; 