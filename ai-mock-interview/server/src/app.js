const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI Mock Interview API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/history', historyRoutes);

module.exports = app;