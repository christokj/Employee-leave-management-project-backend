const pool = require('../config/db');

exports.getDashboard = async (req, res) => {
    try {
        const [empRows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
        if (empRows.length === 0) return res.status(404).json({ msg: 'Employee profile not found' });

        const employeeId = empRows[0].id;

        const [[pending]] = await pool.query(
            'SELECT COUNT(*) AS count FROM leave_applications WHERE employee_id = ? AND status = "pending"', [employeeId]
        );

        const [[approved]] = await pool.query(
            'SELECT COUNT(*) AS count FROM leave_applications WHERE employee_id = ? AND status = "approved"', [employeeId]
        );

        const [[notApproved]] = await pool.query(
            'SELECT COUNT(*) AS count FROM leave_applications WHERE employee_id = ? AND status = "not_approved"', [employeeId]
        );

        const [recentLeaves] = await pool.query(
            `SELECT la.*, lt.name as leave_type
       FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = ?
       ORDER BY la.applied_at DESC
       LIMIT 5`, [employeeId]
        );

        res.json({
            pendingLeaves: pending.count,
            approvedLeaves: approved.count,
            notApprovedLeaves: notApproved.count,
            recentLeaves
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT e.*, u.email, d.name as department_name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.user_id = ?`, [req.user.id]
        );

        if (rows.length === 0) return res.status(404).json({ msg: 'Employee profile not found' });

        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateProfile = async (req, res) => {
    const { phone_number, address } = req.body;
    try {
        const [empRows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
        if (empRows.length === 0) return res.status(404).json({ msg: 'Employee profile not found' });

        await pool.query('UPDATE employees SET phone_number = ?, address = ? WHERE user_id = ?', [phone_number, address, req.user.id]);
        res.json({ msg: 'Profile updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.applyLeave = async (req, res) => {
    const { leave_type_id, from_date, to_date, reason } = req.body;
    try {
        const [empRows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
        if (empRows.length === 0) return res.status(404).json({ msg: 'Employee profile not found' });

        const employeeId = empRows[0].id;

        await pool.query(
            `INSERT INTO leave_applications (employee_id, leave_type_id, from_date, to_date, reason, status, applied_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
            [employeeId, leave_type_id, from_date, to_date, reason]
        );

        res.json({ msg: 'Leave application submitted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getLeaveHistory = async (req, res) => {
    try {
        const [empRows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
        if (empRows.length === 0) return res.status(404).json({ msg: 'Employee profile not found' });

        const employeeId = empRows[0].id;

        const [history] = await pool.query(
            `SELECT la.*, lt.name as leave_type
       FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = ?
       ORDER BY la.applied_at DESC`, [employeeId]
        );

        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
