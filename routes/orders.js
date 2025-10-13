const express = require('express');
const {
  createOrder,
  getOrdersByEmail,
  getOrdersByShippingEmail
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createOrder);

// Get orders for logged-in users
router.get('/my-orders', protect, getOrdersByEmail);

// Get orders for guest users by email
router.get('/guest-orders', getOrdersByShippingEmail);

module.exports = router;