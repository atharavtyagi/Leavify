const express = require('express');
const { register, login, getMe, updateDetails, updatePassword, refreshToken, logout } = require('../controllers/authController');

const router = express.Router();

const { protect, checkDelegation } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, checkDelegation, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
