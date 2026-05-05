const express = require('express');
const { getMe, login, signup } = require('../controllers/authController');
const { protect, requireDatabase } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', requireDatabase, signup);
router.post('/login', requireDatabase, login);
router.get('/me', protect, requireDatabase, getMe);

module.exports = router;
