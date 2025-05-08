// controllers/adminController.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Helper function to handle errors
const handleError = (res, err) => {
    console.error(err.message);
    res.status(500).send('Server error');
};

// Dashboard statistics (Fixed)
exports.getDashboard = async (req, res) => {
    try {
        const [employeeRows] = await pool.query('SELECT COUNT(*) as total FROM tblemployees');
        const totalEmployees = employeeRows[0].total;
        const [deptRows] = await pool.query('SELECT COUNT(*) as total FROM tbldepartments');
        const totalDepartments = deptRows[0].total;

        const [leaveTypeRows] = await pool.query('SELECT COUNT(*) as total FROM tblleavetype');
        const totalLeaveTypes = leaveTypeRows[0].total;

        const [pendingRows] = await pool.query(
            'SELECT COUNT(*) as total FROM tblleaves WHERE Status = 0'
        );
        const pendingLeaves = pendingRows[0].total;

        const [recentRows] = await pool.query(`
            SELECT l.*, e.FirstName, e.LastName, l.LeaveType
            FROM tblleaves l
            JOIN tblemployees e ON l.empid = e.id
            ORDER BY l.PostingDate DESC
            LIMIT 5
        `);
        // console.log(totalEmployees, totalDepartments, totalLeaveTypes, pendingLeaves, recentRows)
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

// Departments
exports.getDepartments = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tbldepartments ORDER BY DepartmentName');
        // console.log(rows)
        res.json(rows);
    } catch (err) {
        handleError(res, err);
    }
};

exports.addDepartment = async (req, res) => {
    const { name, short_name, code } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO tbldepartments (DepartmentName, DepartmentShortName, DepartmentCode) VALUES (?, ?, ?)',
            [name, short_name, code]
        );

        const [newDept] = await pool.query('SELECT * FROM tbldepartments WHERE id = ?', [result.insertId]);
        res.status(201).json(newDept[0]);
    } catch (err) {
        handleError(res, err);
    }
};


exports.updateDepartment = async (req, res) => {
    const { name, short_name, code } = req.body;

    try {
        const [checkRows] = await pool.query('SELECT * FROM tbldepartments WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Department not found' });
        }

        await pool.query(
            'UPDATE tbldepartments SET DepartmentName = ?, DepartmentShortName = ?, DepartmentCode = ? WHERE id = ?',
            [name, short_name, code, req.params.id]
        );

        const [updatedDept] = await pool.query('SELECT * FROM tbldepartments WHERE id = ?', [req.params.id]);
        res.json(updatedDept[0]);
    } catch (err) {
        handleError(res, err);
    }
};


exports.deleteDepartment = async (req, res) => {
    try {
        const [checkRows] = await pool.query('SELECT * FROM tbldepartments WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Department not found' });
        }

        const departmentName = checkRows[0].DepartmentName;
        const [empRows] = await pool.query('SELECT COUNT(*) as count FROM tblemployees WHERE Department = ?', [departmentName]);

        if (empRows[0].count > 0) {
            return res.status(400).json({ msg: 'Cannot delete department with employees assigned' });
        }

        await pool.query('DELETE FROM tbldepartments WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Department deleted' });
    } catch (err) {
        handleError(res, err);
    }
};


// Leave Types
exports.getLeaveTypes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tblleavetype ORDER BY LeaveType');
        res.json(rows);
    } catch (err) {
        handleError(res, err);
    }
};

exports.addLeaveType = async (req, res) => {
    const { LeaveType, Description } = req.body;
    const creationDate = new Date();

    try {
        const [result] = await pool.query(
            'INSERT INTO tblleavetype (LeaveType, Description, CreationDate) VALUES (?, ?, ?)',
            [LeaveType, Description, creationDate]
        );

        const [newLeaveType] = await pool.query('SELECT * FROM tblleavetype WHERE id = ?', [result.insertId]);
        res.json(newLeaveType[0]);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateLeaveType = async (req, res) => {

    const { LeaveType, Description } = req.body;

    try {
        const [checkRows] = await pool.query('SELECT * FROM tblleavetype WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Leave type not found' });
        }

        await pool.query(
            'UPDATE tblleavetype SET LeaveType = ?, Description = ? WHERE id = ?',
            [LeaveType, Description, req.params.id]
        );

        const [updatedLeaveType] = await pool.query('SELECT * FROM tblleavetype WHERE id = ?', [req.params.id]);
        res.json(updatedLeaveType[0]);
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteLeaveType = async (req, res) => {
    try {
        const [checkRows] = await pool.query('SELECT * FROM tblleavetype WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Leave type not found' });
        }

        await pool.query('DELETE FROM tblleavetype WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Leave type deleted' });
    } catch (err) {
        handleError(res, err);
    }
};

// Employees
exports.getEmployees = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tblemployees ORDER BY FirstName');
        res.json(rows);
    } catch (err) {
        handleError(res, err);
    }
};

exports.addEmployee = async (req, res) => {
    const { FirstName, LastName, Department, EmailId, Password, Gender, Dob, Address, City, Country, Phonenumber, Status } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);

        const [result] = await pool.query(
            'INSERT INTO tblemployees (FirstName, LastName, Department, EmailId, Password, Gender, Dob, Address, City, Country, Phonenumber, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [FirstName, LastName, Department, EmailId, hashedPassword, Gender, Dob, Address, City, Country, Phonenumber, Status]
        );

        const [newEmployee] = await pool.query('SELECT * FROM tblemployees WHERE id = ?', [result.insertId]);
        res.json(newEmployee[0]);
    } catch (err) {
        handleError(res, err);
    }
};


exports.updateEmployee = async (req, res) => {
    const { FirstName, LastName, Department, EmailId, Gender, Dob, Address, City, Country, Phonenumber, Status } = req.body;

    try {
        const [checkRows] = await pool.query('SELECT * FROM tblemployees WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        await pool.query(
            'UPDATE tblemployees SET FirstName = ?, LastName = ?, Department = ?, EmailId = ?, Gender = ?, Dob = ?, Address = ?, City = ?, Country = ?, Phonenumber = ?, Status = ? WHERE id = ?',
            [FirstName, LastName, Department, EmailId, Gender, Dob, Address, City, Country, Phonenumber, Status, req.params.id]
        );

        const [updatedEmployee] = await pool.query('SELECT * FROM tblemployees WHERE id = ?', [req.params.id]);
        res.json(updatedEmployee[0]);
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const [checkRows] = await pool.query('SELECT * FROM tblemployees WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        await pool.query('DELETE FROM tblemployees WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Employee deleted' });
    } catch (err) {
        handleError(res, err);
    }
};


// Leave Management
exports.getLeaveApplications = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT l.*, 
                   e.FirstName, 
                   e.LastName, 
                   e.EmpId, 
                   e.EmailId 
            FROM tblleaves l
            JOIN tblemployees e ON l.empid = e.id
        `);
        res.json(rows);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateLeaveApplication = async (req, res) => {
    const { status, adminRemark } = req.body;

    try {
        const [checkRows] = await pool.query('SELECT * FROM tblleaves WHERE id = ?', [req.params.id]);

        if (checkRows.length === 0) {
            return res.status(404).json({ msg: 'Leave application not found' });
        }

        await pool.query(
            'UPDATE tblleaves SET Status = ?, AdminRemark = ?, AdminRemarkDate = NOW() WHERE id = ?',
            [status, adminRemark || '', req.params.id]
        );

        const [updatedLeave] = await pool.query('SELECT * FROM tblleaves WHERE id = ?', [req.params.id]);
        res.json(updatedLeave[0]);
    } catch (err) {
        handleError(res, err);
    }
};

// Update Password
exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const [userRows] = await pool.query('SELECT * FROM tblemployees WHERE id = ?', [req.user.id]);

        if (userRows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, userRows[0].Password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query('UPDATE tblemployees SET Password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        handleError(res, err);
    }
};
