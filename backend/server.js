const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'super-secret-campus-key-123';

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    // Create Tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      college_name TEXT,
      roll_no TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      college_name TEXT,
      content TEXT,
      type TEXT,
      file_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )`);
  }
});

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
    db.run(
      `INSERT INTO users (name, email, password, college_name, roll_no) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, college_name, roll_no],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const user = { id: this.lastID, name, email, college_name, roll_no };
        const token = jwt.sign(user, JWT_SECRET);
        res.json({ token, user });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, row.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const aUser = { id: row.id, name: row.name, email: row.email, college_name: row.college_name, roll_no: row.roll_no, avatar_url: row.avatar_url };
    const token = jwt.sign(aUser, JWT_SECRET);
    res.json({ token, user: aUser });
  });
});

// API: Get Current User
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(`SELECT id, name, email, college_name, roll_no, avatar_url, created_at FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ user: row });
  });
});

// API: Get Profile Stats
app.get('/api/profiles/stats', authenticateToken, (req, res) => {
  db.all(`SELECT type FROM posts WHERE user_id = ?`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ posts: rows });
  });
});

// API: Get Posts (Feed)
app.get('/api/posts', authenticateToken, (req, res) => {
  const query = `
    SELECT p.*, u.name as user_name, u.avatar_url, u.college_name as user_college
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.college_name = ?
    ORDER BY p.created_at DESC
  `;
  db.all(query, [req.user.college_name], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    // Format to match old supabase structure
    const formatted = rows.map(r => ({
      id: r.id, user_id: r.user_id, content: r.content, type: r.type, created_at: r.created_at, college_name: r.college_name,
      profiles: { name: r.user_name, avatar_url: r.avatar_url, college_name: r.user_college }
    }));
    res.json(formatted);
  });
});

// API: Create Post
app.post('/api/posts', authenticateToken, (req, res) => {
  const { content, type, college_name } = req.body;
  db.run(
    `INSERT INTO posts (user_id, college_name, content, type) VALUES (?, ?, ?, ?)`,
    [req.user.id, college_name, content, type],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Post created', id: this.lastID });
    }
  );
});

// API: Get Peers for Messaging
app.get('/api/peers', authenticateToken, (req, res) => {
  db.all(
    `SELECT id, name, college_name, roll_no, avatar_url FROM users WHERE college_name = ? AND id != ?`,
    [req.user.college_name, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// API: Get Target Profile
app.get('/api/peers/:id', authenticateToken, (req, res) => {
  db.get(`SELECT id, name, college_name, roll_no, avatar_url FROM users WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// API: Get Messages with specific peer
app.get('/api/messages/:targetId', authenticateToken, (req, res) => {
  const { targetId } = req.params;
  db.all(
    `SELECT * FROM messages WHERE 
    (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC`,
    [req.user.id, targetId, targetId, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// API: Send Message
app.post('/api/messages', authenticateToken, (req, res) => {
  const { receiver_id, content } = req.body;
  db.run(
    `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`,
    [req.user.id, receiver_id, content],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      db.get('SELECT * FROM messages WHERE id = ?', [this.lastID], (err, row) => {
        res.json(row);
      });
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
