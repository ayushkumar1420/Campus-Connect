const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { formatUser } = require('../utils/generateToken');
const sendServerError = require('../utils/sendServerError');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getPeers(req, res) {
  try {
    const peers = await User.find({
      college_name: req.user.college_name,
      _id: { $ne: req.user.id },
    });

    return res.json(peers.map(formatUser));
  } catch (error) {
    return sendServerError(res, error);
  }
}

async function getPeerProfile(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  try {
    const peer = await User.findById(req.params.id);
    if (!peer) return res.status(404).json({ error: 'User not found.' });

    return res.json(formatUser(peer));
  } catch (error) {
    return sendServerError(res, error);
  }
}

async function getMessages(req, res) {
  const { targetId } = req.params;

  if (!isValidId(targetId)) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id, receiver_id: targetId },
        { sender_id: targetId, receiver_id: req.user.id },
      ],
    }).sort({ created_at: 1 });

    return res.json(messages);
  } catch (error) {
    return sendServerError(res, error);
  }
}

async function sendMessage(req, res) {
  const { receiver_id, content } = req.body;

  if (!isValidId(receiver_id) || !content || !content.trim()) {
    return res.status(400).json({ error: 'Receiver and message are required.' });
  }

  try {
    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      content,
    });

    return res.status(201).json(message);
  } catch (error) {
    return sendServerError(res, error);
  }
}

module.exports = {
  getPeers,
  getPeerProfile,
  getMessages,
  sendMessage,
};
