const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        let userData = { id: user.id, email: user.email, role: user.role };

        if (user.role === 'employee') {
            const [employeeRows] = await pool.query(
                'SELECT e.*, d.name as department_name FROM employees e ' +
                'LEFT JOIN departments d ON e.department_id = d.id ' +
                'WHERE e.user_id = ?',
                [user.id]
            );
            if (employeeRows.length > 0) {
                userData = { ...userData, profile: employeeRows[0] };
            }
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: userData });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get logged-in user
exports.getLoggedInUser = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const user = rows[0];
        let userData = { id: user.id, email: user.email, role: user.role };

        if (user.role === 'employee') {
            const [employeeRows] = await pool.query(
                'SELECT e.*, d.name as department_name FROM employees e ' +
                'LEFT JOIN departments d ON e.department_id = d.id ' +
                'WHERE e.user_id = ?',
                [user.id]
            );
            if (employeeRows.length > 0) {
                userData = { ...userData, profile: employeeRows[0] };
            }
        }

        res.json(userData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
