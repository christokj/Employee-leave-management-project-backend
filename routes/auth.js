const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    loginUser,
    getLoggedInUser,
    updatePassword
} = require('../controllers/authController');

// Auth routes
router.post('/login', loginUser);
router.get('/user', auth, getLoggedInUser);
router.put('/password', auth, updatePassword);

module.exports = router;
