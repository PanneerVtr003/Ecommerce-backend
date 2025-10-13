const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Debug endpoint to check MongoDB status
app.get('/api/debug/mongodb', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const dbName = mongoose.connection.db?.databaseName;
    
    res.json({
      success: true,
      mongodb: {
        connected: isConnected,
        database: dbName,
        readyState: mongoose.connection.readyState,
        connectionString: process.env.MONGODB_URI ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    res.json({
      success: false,
      mongodb: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Test user creation directly
app.post('/api/debug/test-register', async (req, res) => {
  try {
    const User = require('./models/User');
    const { username, email, password } = req.body;
    
    const testUser = await User.create({
      username: username || 'testuser',
      email: email || 'test@example.com', 
      password: password || 'password123'
    });
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: testUser._id,
        username: testUser.username,
        email: testUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test registration failed',
      error: error.message
    });
  }
});

// Import routes
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
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection with detailed logging
console.log('🔧 Attempting MongoDB connection...');
console.log('📝 Connection string:', process.env.MONGODB_URI ? 'Set' : 'Not set');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:');
  console.error('Error:', error.message);
  console.log('💡 Please check your MONGODB_URI environment variable');
  
  // Start server without MongoDB for debugging
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (without MongoDB)`);
    console.log('⚠️  Some features may not work without database connection');
  });
});

module.exports = app;