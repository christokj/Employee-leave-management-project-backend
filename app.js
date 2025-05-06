const express = require('express');
const cors = require("cors");
const app = express();
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use(express.json());

const corsOptions = {
    origin: [process.env.CLIENT_DOMAIN],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies, etc.)
    optionSuccessStatus: 200, // Success status for older browsers (IE11, etc.)
};

app.use(cors(corsOptions));

app.use('/api/employee', employeeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
