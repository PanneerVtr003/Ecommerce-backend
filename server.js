const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// FIXED CORS configuration - Allow both localhost and production
app.use(cors({
  origin: [
    'http://localhost:3000',  // Your local development
    'https://ecommerce-frontend-flax-psi.vercel.app',  // Your production frontend
    'http://localhost:3001',  // Optional: other local ports
    'https://your-other-domain.vercel.app'  // Any other domains you use
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Import and use routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running with CORS fixed!',
    timestamp: new Date().toISOString(),
    allowedOrigins: [
      'http://localhost:3000',
      'https://ecommerce-frontend-flax-psi.vercel.app'
    ]
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`✅ CORS enabled for:`);
      console.log(`   - http://localhost:3000`);
      console.log(`   - https://ecommerce-frontend-flax-psi.vercel.app`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without MongoDB)`);
    });
  });

module.exports = app;