const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());



app.listen(5000, () => console.log('Server running on http://localhost:5000'));