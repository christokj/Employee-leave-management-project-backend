const crypto = require('crypto'); // Built-in Node.js module
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

exports.loginAdmin = async (req, res) => {
    const { UserName, Password, role } = req.body;

    try {
        if (role !== 'admin') {
            return res.status(400).json({ msg: 'Please use admin login option' });
        }

        const [rows] = await pool.query('SELECT * FROM admin WHERE UserName = ?', [UserName]);

        const admin = rows[0];
        if (!admin) {
            return res.status(400).json({ msg: 'Admin not found' });
        }

        // Generate MD5 hash of incoming password
        const md5Hash = crypto.createHash('md5').update(Password).digest('hex');

        if (md5Hash !== admin.Password) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: admin.id,
                role: role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            return res.status(200).json({ token, role });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
