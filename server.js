const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

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
        usingAtlas: true,
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

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({
    success: true,
    message: 'Server is running with MongoDB Atlas!',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('🔧 Connecting to MongoDB Atlas...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('📝 Using database:', process.env.MONGODB_URI.split('@')[1]?.split('/')[1]?.split('?')[0] || 'unknown');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error('Error message:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('\n🔑 AUTHENTICATION FAILED:');
      console.log('Please check:');
      console.log('1. MongoDB Atlas Database Access - user "panneer" exists');
      console.log('2. Password is correct');
      console.log('3. Network Access allows all IPs (0.0.0.0/0)');
    }
    
    // Don't exit - let server run without DB
    console.log('⚠️  Server running without database connection');
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: https://ecommerce-backend-9987.onrender.com/api/health`);
  console.log(`📍 Debug: https://ecommerce-backend-9987.onrender.com/api/debug/mongodb`);
  
  await connectDB();
});

module.exports = app;
