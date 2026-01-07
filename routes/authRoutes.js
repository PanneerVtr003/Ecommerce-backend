const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

/* ================= TEST ================= */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!'
  });
});

/* ================= AUTH ================= */
router.post('/register', registerUser);
router.post('/login', loginUser);

/* ================= PASSWORD RESET ================= */
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

/* ================= PROFILE ================= */
router.get('/profile', protect, getUserProfile);

module.exports = router;
