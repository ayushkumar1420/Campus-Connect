const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'super-secret-campus-key-123';

// Connect to MongoDB
const MONGO_URI = 'mongodb://ayushmaurya496_db_user:ayush123@ac-hjd8hbk-shard-00-00.ik7tacw.mongodb.net:27017,ac-hjd8hbk-shard-00-01.ik7tacw.mongodb.net:27017,ac-hjd8hbk-shard-00-02.ik7tacw.mongodb.net:27017/?ssl=true&replicaSet=atlas-zlfqdg-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Mongoose Models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  college_name: String,
  roll_no: String,
  avatar_url: String,
  created_at: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  college_name: String,
  content: String,
  type: String,
  file_url: String,
  created_at: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  created_at: { type: Date, default: Date.now }
});

// Setting virtuals to map _id to id so frontend doesn't break
userSchema.set('toJSON', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });
messageSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Message = mongoose.model('Message', messageSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API: Auth Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, college_name, roll_no } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, college_name, roll_no });
    await user.save();
    
    const userPayload = { id: user._id.toString(), name, email, college_name, roll_no };
    const token = jwt.sign(userPayload, JWT_SECRET);
    res.json({ token, user: userPayload });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const userPayload = { id: user._id.toString(), name: user.name, email: user.email, college_name: user.college_name, roll_no: user.roll_no, avatar_url: user.avatar_url };
    const token = jwt.sign(userPayload, JWT_SECRET);
    res.json({ token, user: userPayload });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Profile Stats
app.get('/api/profiles/stats', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ user_id: req.user.id }).select('type');
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Posts (Feed)
app.get('/api/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ college_name: req.user.college_name })
      .populate('user_id', 'name avatar_url college_name')
      .sort({ created_at: -1 });

    const formatted = posts.map(p => ({
      id: p._id.toString(),
      user_id: p.user_id ? p.user_id._id.toString() : null,
      content: p.content,
      type: p.type,
      created_at: p.created_at,
      college_name: p.college_name,
      profiles: p.user_id ? { 
        name: p.user_id.name, 
        avatar_url: p.user_id.avatar_url, 
        college_name: p.user_id.college_name 
      } : { name: 'Unknown', college_name: 'Unknown' }
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Create Post
app.post('/api/posts', authenticateToken, async (req, res) => {
  const { content, type, college_name } = req.body;
  try {
    const newPost = new Post({ user_id: req.user.id, college_name, content, type });
    await newPost.save();
    res.json({ message: 'Post created', id: newPost._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Peers for Messaging
app.get('/api/peers', authenticateToken, async (req, res) => {
  try {
    const peers = await User.find({ 
      college_name: req.user.college_name,
      _id: { $ne: req.user.id }
    }).select('-password');
    res.json(peers);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Target Profile
app.get('/api/peers/:id', authenticateToken, async (req, res) => {
  try {
    const peer = await User.findById(req.params.id).select('-password');
    if (!peer) return res.status(404).json({ error: 'Not found' });
    res.json(peer);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Messages with specific peer
app.get('/api/messages/:targetId', authenticateToken, async (req, res) => {
  const { targetId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id, receiver_id: targetId },
        { sender_id: targetId, receiver_id: req.user.id }
      ]
    }).sort({ created_at: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Send Message
app.post('/api/messages', authenticateToken, async (req, res) => {
  const { receiver_id, content } = req.body;
  try {
    const message = new Message({
      sender_id: req.user.id,
      receiver_id: receiver_id,
      content: content
    });
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
