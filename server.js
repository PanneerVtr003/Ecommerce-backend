// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders'); // Add this line

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // Add this line

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running with orders endpoint!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health',
      'POST /api/orders',
      'GET /api/orders',
      'GET /api/products'
    ]
  });
});

// Test orders endpoint directly
app.get('/api/test-order', (req, res) => {
  res.json({
    success: true,
    message: 'Orders endpoint is working!',
    testData: {
      items: [{ id: '1', name: 'Test', price: 100, quantity: 1 }],
      total: 100
    }
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/api/health`);
      console.log(`📍 Orders: http://localhost:${PORT}/api/orders`);
      console.log(`📍 Test: http://localhost:${PORT}/api/test-order`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    // Start server even without MongoDB
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without MongoDB)`);
      console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    });
  });

module.exports = app;