import express from "express";
import { createOrder, getAllOrders, getOrdersByEmail } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);            // Create order
router.get("/", getAllOrders);            // Get all orders
router.get("/:email", getOrdersByEmail);  // Get orders by email

export default router;
