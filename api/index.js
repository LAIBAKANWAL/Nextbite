// File: NetxBite-Frontend-Repo/api/index.js

// Load environment variables
require("dotenv").config();

const express = require("express");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Connect to MongoDB
connectDB();

// Basic health check route
app.get("/", (req, res) => {
  res.json({ message: "NextBite API is running!", success: true });
});

// Import and use API routes (for local development)
app.post("/api/createUser", require("./createUser"));
app.post("/api/loginUser", require("./loginUser"));
app.get("/api/foodData", require("./foodData"));
app.get("/api/foodCategory", require("./foodCategory"));
app.post("/api/orderData", require("./orderData"));
app.post("/api/myOrderData", require("./myOrderData"));
app.get("/api/health", require("./health"));
app.post("/api/forgotPassword", require("./forgotPassword"));
app.post("/api/resetPassword", require("./resetPassword"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API available at http://localhost:${PORT}`);
  });
}

module.exports = app;