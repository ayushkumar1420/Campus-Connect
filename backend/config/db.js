const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_connect';
async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Use local MongoDB or set MONGO_URI in backend/.env.');
  }
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error.message);
});

module.exports = {
  connectDatabase,
  isDatabaseReady,
};
