const express = require('express');
const router = express.Router();
const OEEController = require('../controllers/oeeController');

// Get overall OEE summary
router.get('/summary', OEEController.getOEESummary);

// Get OEE waterfall data
router.get('/waterfall', OEEController.getOEEWaterfall);

// Get OEE metrics over time
router.get('/timeline', OEEController.getOEETimeline);

// Get stop causes
router.get('/stops', OEEController.getStopCauses);

module.exports = router; 