import Order from "../models/Order.js";

// ✅ Create new order
export const createOrder = async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, email, paymentCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No order items provided" });
    }

    const order = new Order({
      items,
      total,
      shippingAddress,
      paymentMethod,
      email,
      paymentCode,
    });

    const savedOrder = await order.save();
    console.log("✅ Order saved:", savedOrder);
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Failed to create order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// ✅ Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ✅ Get orders by email
export const getOrdersByEmail = async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};
