const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmation, sendAdminNotification } = require('../utils/emailService');

// Helper: Verify JWT token
const verifyToken = async (token) => {
  try {
    // Simple implementation - replace with your JWT verification
    const user = await User.findById(token);
    return user;
  } catch (error) {
    return null;
  }
};

// Middleware to verify authentication
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, paymentCode } = req.body;
    
    console.log('📦 Creating new order:', {
      itemsCount: items?.length,
      total,
      email: shippingAddress?.email,
      paymentMethod
    });

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.email) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address with email is required'
      });
    }

    // Get user by email (if exists)
    let user = null;
    if (shippingAddress.email) {
      user = await User.findOne({ email: shippingAddress.email.toLowerCase() });
    }

    // Generate payment code for COD
    const finalPaymentCode = paymentMethod === 'cod' 
      ? (paymentCode || Math.floor(100000 + Math.random() * 900000).toString())
      : null;

    // Create order
    const order = new Order({
      user: user ? user._id : null,
      items: items.map(item => ({
        productId: item.id || item._id || `prod_${Date.now()}_${Math.random()}`,
        name: item.name || 'Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || item.imageUrl || ''
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName || '',
        lastName: shippingAddress.lastName || '',
        email: shippingAddress.email.toLowerCase(),
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        zipCode: shippingAddress.zipCode || '',
        country: shippingAddress.country || 'United States',
        phone: shippingAddress.phone || ''
      },
      paymentMethod: paymentMethod || 'card',
      paymentCode: finalPaymentCode,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'pending',
      totalAmount: total || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      shippingFee: 0,
      tax: 0
    });

    // Save order
    await order.save();
    console.log('✅ Order saved:', order._id);

    // Send emails
    try {
      if (user) {
        await sendOrderConfirmation(order, user);
      } else {
        // Send to guest
        const guestUser = { username: shippingAddress.firstName, email: shippingAddress.email };
        await sendOrderConfirmation(order, guestUser);
      }
      
      await sendAdminNotification(order);
    } catch (emailError) {
      console.error('Email error (order still saved):', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: {
        _id: order._id,
        orderId: order.orderId,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentCode: order.paymentCode,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get orders for logged-in user
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📋 Found ${orders.length} orders for user: ${req.user.email}`);

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: `ORD${order._id.toString().slice(-8).toUpperCase()}`,
      items: order.items,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentCode: order.paymentCode,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get orders by email (for guest users)
router.get('/guest-orders', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    console.log(`🔍 Looking for guest orders for: ${email}`);

    const orders = await Order.find({ 
      'shippingAddress.email': email.toLowerCase(),
      user: null // Only guest orders (no user account)
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log(`📋 Found ${orders.length} guest orders for: ${email}`);

    // Format orders
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: `ORD${order._id.toString().slice(-8).toUpperCase()}`,
      items: order.items,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentCode: order.paymentCode,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Get guest orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Format order
    const formattedOrder = {
      _id: order._id,
      orderId: `ORD${order._id.toString().slice(-8).toUpperCase()}`,
      items: order.items,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentCode: order.paymentCode,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json({
      success: true,
      order: formattedOrder
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Get all orders (admin only)
router.get('/', async (req, res) => {
  try {
    // Simple admin check - in production, use proper authentication
    if (!req.headers['x-admin-secret'] || req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username email')
      .lean();

    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        _id: order._id,
        orderId: `ORD${order._id.toString().slice(-8).toUpperCase()}`,
        user: order.user,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Update order status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Simple admin check
    if (!req.headers['x-admin-secret'] || req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    ).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`✅ Order ${order._id} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Order status updated',
      order: {
        _id: order._id,
        orderId: `ORD${order._id.toString().slice(-8).toUpperCase()}`,
        orderStatus: order.orderStatus,
        status: order.orderStatus // For frontend compatibility
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

// Test endpoint
router.get('/test/hello', (req, res) => {
  res.json({
    success: true,
    message: 'Order routes are working!',
    endpoints: [
      'POST / - Create new order',
      'GET /my-orders - Get user orders (auth required)',
      'GET /guest-orders?email=... - Get guest orders by email',
      'GET /:id - Get specific order (auth required)',
      'GET / - Get all orders (admin)',
      'PATCH /:id/status - Update order status (admin)'
    ]
  });
});

module.exports = router;