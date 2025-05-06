const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');

// Routes
router.get('/dashboard', auth, employeeController.getDashboard);
router.get('/profile', auth, employeeController.getProfile);
router.put('/profile', auth, employeeController.updateProfile);
router.post('/apply-leave', auth, employeeController.applyLeave);
router.get('/leave-history', auth, employeeController.getLeaveHistory);

module.exports = router;
