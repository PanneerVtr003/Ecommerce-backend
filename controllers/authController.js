import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, paymentCode, email } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      items,
      total,
      shippingAddress,
      paymentMethod,
      paymentCode,
      email
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order" });
  }
};