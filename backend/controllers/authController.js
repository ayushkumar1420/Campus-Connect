const bcrypt = require('bcrypt');
const User = require('../models/User');
const { formatUser, generateToken } = require('../utils/generateToken');
const sendServerError = require('../utils/sendServerError');

async function signup(req, res) {
  const { name, email, password, college_name, roll_no } = req.body;

  if (!name || !email || !password || !college_name || !roll_no) {
    return res.status(400).json({ error: 'Please fill all signup fields.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college_name,
      roll_no,
    });

    return res.json(generateToken(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    return sendServerError(res, error);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const passwordMatches = user && await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    return res.json(generateToken(user));
  } catch (error) {
    return sendServerError(res, error);
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    return res.json({ user: formatUser(user) });
  } catch (error) {
    return sendServerError(res, error);
  }
}

module.exports = {
  signup,
  login,
  getMe,
};
