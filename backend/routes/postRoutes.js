const express = require('express');
const { createPost, getPosts, getProfileStats } = require('../controllers/postController');
const { protect, requireDatabase } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/posts', protect, requireDatabase, getPosts);
router.post('/posts', protect, requireDatabase, createPost);
router.get('/profiles/stats', protect, requireDatabase, getProfileStats);

module.exports = router;
