const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/dashboard', dashboardController.getUserStats);
router.get('/platform-stats', dashboardController.getGlobalStats);

module.exports = router;
