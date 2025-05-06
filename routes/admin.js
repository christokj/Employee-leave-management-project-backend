// routes/admin.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', adminAuth, adminController.getDashboard);

// Departments
router.get('/departments', adminAuth, adminController.getDepartments);
router.post('/departments', adminAuth, adminController.addDepartment);
router.get('/departments/:id', adminAuth, adminController.getDepartmentById);
router.put('/departments/:id', adminAuth, adminController.updateDepartment);
router.delete('/departments/:id', adminAuth, adminController.deleteDepartment);


module.exports = router;
