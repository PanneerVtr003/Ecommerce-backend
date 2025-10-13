const Order = require('../models/Order');

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      total,
      shippingAddress,
      paymentMethod,
      paymentCode
    } = req.body;

    console.log('📦 Creating order for email:', shippingAddress?.email);

    // Create order with user email
    const order = new Order({
      user: req.user?._id,
      userEmail: shippingAddress.email, // Store user email
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: total,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentCode: paymentMethod === 'cod' ? paymentCode : null,
      status: 'pending'
    });

    const savedOrder = await order.save();
    
    console.log('✅ Order saved for email:', shippingAddress.email);

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: savedOrder
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Get orders by user email
const getOrdersByEmail = async (req, res) => {
  try {
    const userEmail = req.user.email; // Get email from authenticated user
    
    console.log('📋 Fetching orders for email:', userEmail);

    const orders = await Order.find({ userEmail: userEmail })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for ${userEmail}`);

    res.json({
      success: true,
      orders: orders,
      userEmail: userEmail
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get orders for guest users by email from shipping address
const getOrdersByShippingEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('📋 Fetching orders for shipping email:', email);

    const orders = await Order.find({ 'shippingAddress.email': email })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for shipping email: ${email}`);

    res.json({
      success: true,
      orders: orders,
      userEmail: email
    });
  } catch (error) {
    console.error('Get orders by shipping email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

module.exports = {
  createOrder,
  getOrdersByEmail,
  getOrdersByShippingEmail
};