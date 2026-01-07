const Order = require("../models/Order");
const { sendOrderConfirmation } = require("../utils/mailer");

const createOrder = async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, paymentCode } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const order = await Order.create({
      items,
      total,
      shippingAddress,
      paymentMethod,
      paymentCode,
      user: req.user?._id || null,
    });

    // Send email
    sendOrderConfirmation(order, req.user)
      .then(() => console.log("✅ Order email sent"))
      .catch(err => console.error("❌ Failed sending order email", err));

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to create order" });
  }
};

module.exports = { createOrder };
