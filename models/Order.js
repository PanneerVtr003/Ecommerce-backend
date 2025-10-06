import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  items: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      image: String,
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ["card", "cod"], required: true },
  paymentCode: { type: String },
  email: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
