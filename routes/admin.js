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
// router.get('/departments/:id', adminAuth, adminController.getDepartmentById);
router.put('/departments/:id', adminAuth, adminController.updateDepartment);
router.delete('/departments/:id', adminAuth, adminController.deleteDepartment);
router.get('/leavetypes', adminAuth, adminController.getLeaveTypes)
router.post('/leavetypes', adminAuth, adminController.addLeaveType)
router.delete('/leavetypes/:id', adminAuth, adminController.deleteLeaveType)
router.put('/leavetypes/:id', adminAuth, adminController.updateLeaveType)
router.get('/employees', adminAuth, adminController.getEmployees)
router.post('/employees', adminAuth, adminController.addEmployee)
router.put('/employees/:id', adminAuth, adminController.updateEmployee)
router.delete('/employees/:id', adminAuth, adminController.deleteEmployee)

module.exports = router;
