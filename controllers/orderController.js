const Order = require('../models/order.model');
const { sendOrderConfirmation } = require('../utils/mailer');

const createOrder = async (req, res) => {
  try {
    const user = req.user || {}; // From auth middleware
    const { items, total, shippingAddress, paymentMethod, paymentCode } = req.body;

    const order = new Order({
      user: user._id || null,
      items,
      total,
      shippingAddress,
      paymentMethod,
      paymentCode,
    });

    await order.save();

    // Send email
    const emailResult = await sendOrderConfirmation(order, user);
    console.log('Email result:', emailResult);

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('❌ Order creation failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder };
