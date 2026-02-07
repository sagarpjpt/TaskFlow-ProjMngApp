const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getProjectStats,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/project/:projectId', protect, getProjectStats);

module.exports = router;