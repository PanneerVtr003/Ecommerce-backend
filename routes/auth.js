const express = require('express');
const { protect } = require('../middleware/authMiddleware');

// Try to use real controller, fall back to temporary one
let authController;
try {
  authController = require('../controllers/authController');
} catch (error) {
  console.log('⚠️ Using temporary auth controller (MongoDB not available)');
  authController = require('../controllers/tempAuthController');
}

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// This still requires real MongoDB
router.get('/profile', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Profile endpoint requires MongoDB connection',
    user: req.user
  });
});

module.exports = router;