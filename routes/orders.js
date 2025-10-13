// routes/orders.js
const express = require('express');
const router = express.Router();

// POST /api/orders - Create new order
router.post('/', (req, res) => {
  try {
    const orderData = req.body;
    
    console.log('📦 Order received:', orderData);
    
    // Create a simple order response
    const order = {
      id: 'ORD-' + Date.now(),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// GET /api/orders - Get user orders
router.get('/', (req, res) => {
  res.json({
    success: true,
    orders: []
  });
});

// GET /api/orders/:id - Get specific order
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    order: {
      id: req.params.id,
      status: 'pending',
      items: [],
      total: 0
    }
  });
});

module.exports = router;