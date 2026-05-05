const express = require('express');
const {
  getMessages,
  getPeerProfile,
  getPeers,
  sendMessage,
} = require('../controllers/messageController');
const { protect, requireDatabase } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/peers', protect, requireDatabase, getPeers);
router.get('/peers/:id', protect, requireDatabase, getPeerProfile);
router.get('/messages/:targetId', protect, requireDatabase, getMessages);
router.post('/messages', protect, requireDatabase, sendMessage);

module.exports = router;
