// controllers/adminController.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Helper function to handle errors
const handleError = (res, err) => {
    console.error(err.message);
    res.status(500).send('Server error');
};

// @route   GET api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin only)
exports.getDashboard = async (req, res) => {
    try {
        const [employeeRows] = await pool.query('SELECT COUNT(*) as total FROM employees');
        const totalEmployees = employeeRows[0].total;

        const [deptRows] = await pool.query('SELECT COUNT(*) as total FROM departments');
        const totalDepartments = deptRows[0].total;

        const [leaveTypeRows] = await pool.query('SELECT COUNT(*) as total FROM leave_types');
        const totalLeaveTypes = leaveTypeRows[0].total;

        const [pendingRows] = await pool.query(
            'SELECT COUNT(*) as total FROM leave_applications WHERE status = "pending"'
        );
        const pendingLeaves = pendingRows[0].total;

        const [recentRows] = await pool.query(
            'SELECT la.*, e.first_name, e.last_name, lt.name as leave_type ' +
            'FROM leave_applications la ' +
            'JOIN employees e ON la.employee_id = e.id ' +
            'JOIN leave_types lt ON la.leave_type_id = lt.id ' +
            'ORDER BY la.applied_at DESC LIMIT 5'
        );

        res.json({
            totalEmployees,
            totalDepartments,
            totalLeaveTypes,
            pendingLeaves,
            recentLeaves: recentRows
        });
    } catch (err) {
        handleError(res, err);
    }
};

// @route   GET api/admin/departments
// @desc    Get all departments
// @access  Private (Admin only)
exports.getDepartments = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM departments ORDER BY name');
        res.json(rows);
    } catch (err) {
        handleError(res, err);
    }
};

// @route   POST api/admin/departments
// @desc    Add a new department
// @access  Private (Admin only)
exports.addDepartment = async (req, res) => {
    const { name, short_name, code } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO departments (name, short_name, code) VALUES (?, ?, ?)',
            [name, short_name, code]
        );

        const [newDept] = await pool.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
        res.json(newDept[0]);
    } catch (err) {
        handleError(res, err);
    }
};

// @route   GET api/admin/departments/:id
// @desc    Get department by ID
// @access  Private (Admin only)
exports.getDepartmentById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Department not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        handleError(res, err);
    }
};

// @route   PUT api/admin/departments/:id
// @desc    Update department
// @access  Private (Admin only)
exports.updateDepartment = async (req, res) => {
    const { name, short_name, code } = req.body;

    try {
        const [checkRows] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Department not found' });
        }

        await pool.query(
            'UPDATE departments SET name = ?, short_name = ?, code = ? WHERE id = ?',
            [name, short_name, code, req.params.id]
        );

        const [updatedDept] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
        res.json(updatedDept[0]);
    } catch (err) {
        handleError(res, err);
    }
};

// @route   DELETE api/admin/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
exports.deleteDepartment = async (req, res) => {
    try {
        const [checkRows] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Department not found' });
        }

        const [empRows] = await pool.query('SELECT COUNT(*) as count FROM employees WHERE department_id = ?', [req.params.id]);

        if (empRows[0].count > 0) {
            return res.status(400).json({ msg: 'Cannot delete department that has employees assigned to it' });
        }

        await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Department deleted' });
    } catch (err) {
        handleError(res, err);
    }
};


