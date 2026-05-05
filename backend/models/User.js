const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  college_name: { type: String, required: true, trim: true },
  roll_no: { type: String, required: true, trim: true },
  avatar_url: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
