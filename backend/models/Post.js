const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college_name: { type: String, required: true },
  content: { type: String, required: true, trim: true },
  type: { type: String, enum: ['general', 'note', 'query'], default: 'general' },
  file_url: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);
