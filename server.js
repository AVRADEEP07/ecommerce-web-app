require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Serve frontend in production

  app.use(express.static((__dirname)));
  app.get('*', (req, res) =>{ res.sendFile(path.join(__dirname + 'index.html'))});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});
app.get('/debug', (req, res) => {
  const fs = require('fs');
  res.json({
    dirname: __dirname,
    files: fs.readdirSync(__dirname),
    indexExists: fs.existsSync(__dirname + '/index.html')
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));