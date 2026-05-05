const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

loadEnvFile();

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

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separator = trimmed.indexOf('=');
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    process.env[key] = process.env[key] || value;
  });
}
