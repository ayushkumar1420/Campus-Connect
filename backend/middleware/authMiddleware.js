const jwt = require('jsonwebtoken');
const { isDatabaseReady } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(403).json({ error: 'Session expired. Please login again.' });
  }
}

function requireDatabase(req, res, next) {
  if (isDatabaseReady()) return next();

  return res.status(503).json({
    error: 'Database is not connected. Start MongoDB or set a valid MONGO_URI.',
  });
}

module.exports = {
  protect,
  requireDatabase,
};
