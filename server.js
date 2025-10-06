import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import orderRoutes from "./routes/orderRoutes.js";
// import userRoutes from "./routes/userRoutes.js"; // if needed

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/orders", orderRoutes);
// app.use("/api/users", userRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection failed:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

