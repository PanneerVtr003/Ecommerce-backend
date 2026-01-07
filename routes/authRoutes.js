const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!'
  });
});

// Register endpoint (simplified)
router.post('/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    user: {
      id: 'user_' + Date.now(),
      username,
      email
    },
    token: 'test_token_' + Date.now()
  });
});

// Login endpoint (simplified)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Login successful!',
    user: {
      id: 'user_123',
      username: 'testuser',
      email: email
    },
    token: 'test_token_' + Date.now()
  });
});

module.exports = router;
