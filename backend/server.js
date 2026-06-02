const express = require('express');
const cors = require('cors');
require('dotenv').config();


const { connectDatabase, isDatabaseReady } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    server: 'ok',
    database: isDatabaseReady() ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', postRoutes);
app.use('/api', messageRoutes);

connectDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
});
