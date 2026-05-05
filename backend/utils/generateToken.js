const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

function formatUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    college_name: user.college_name,
    roll_no: user.roll_no,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
  };
}

function generateToken(user) {
  const safeUser = formatUser(user);
  const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '7d' });
  return { token, user: safeUser };
}

module.exports = {
  formatUser,
  generateToken,
};
