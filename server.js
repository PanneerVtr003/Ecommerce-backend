const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { sendOrderConfirmation } = require('./utils/mailer'); // Import your mailer

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://ecommerce-frontend-flax-psi.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err.message));

// --- Orders Route ---
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📦 Order received:', req.body);

    const orderId = 'ORD' + Date.now().toString().slice(-8);
    const paymentCode = req.body.paymentMethod === 'cod' 
      ? Math.floor(100000 + Math.random() * 900000).toString() 
      : null;

    const order = {
      _id: orderId,
      orderId: orderId,
      items: req.body.items || [],
      shippingAddress: req.body.shippingAddress || {},
      paymentMethod: req.body.paymentMethod || 'card',
      paymentCode: paymentCode,
      total: req.body.total || 0,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date()
    };

    // Send email to user
    if (order.shippingAddress.email) {
      const user = { username: order.shippingAddress.firstName || 'Customer' };
      const emailResult = await sendOrderConfirmation(order, user);
      console.log('📧 Email result:', emailResult);
    } else {
      console.log('⚠️ No email provided for order. Skipping email.');
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order,
      paymentCode
    });

  } catch (error) {
    console.error('❌ Order creation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Test order route ---
app.get('/api/orders/test', (req, res) => {
  res.json({
    success: true,
    message: 'Order API is working!',
    timestamp: new Date().toISOString()
  });
});

// --- Auth routes ---
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    user: { id: 'user_' + Date.now(), username, email },
    token: 'test_token_' + Date.now()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  res.status(200).json({
    success: true,
    message: 'Login successful!',
    user: { id: 'user_123', username: 'testuser', email },
    token: 'test_token_' + Date.now()
  });
});

app.get('/api/auth/test', (req, res) => {
  res.json({ success: true, message: 'Auth API is working!' });
});

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// --- Root ---
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce Backend API',
    version: '1.0.0',
    status: '✅ Running',
    endpoints: {
      health: 'GET /api/health',
      test: 'GET /api/test',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        test: 'GET /api/auth/test'
      },
      orders: {
        create: 'POST /api/orders',
        test: 'GET /api/orders/test'
      }
    }
  });
});

// --- Error handling ---
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// --- 404 handler ---
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found', requestedUrl: req.originalUrl });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
    🚀 Server running on port ${PORT}
    📝 API: http://localhost:${PORT}
    🔗 Frontend: http://localhost:3000
    🗄️  Database: ${mongoUri}
  `);
});

