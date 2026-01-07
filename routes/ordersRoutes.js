const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { sendOrderConfirmation } = require("../utils/mailer");

router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // Send confirmation email
    await sendOrderConfirmation(savedOrder, { username: req.body.shippingAddress.firstName });

    res.status(201).json({ order: savedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

module.exports = router;
