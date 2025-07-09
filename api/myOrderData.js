// File: NetxBite-Frontend-Repo/api/myOrderData.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

// Database connection
const connectDB = require("./db"); // Adjust path if db.js is not directly in 'api/'
const Order = require("./models/Orders"); // Adjust path to your Order model relative to 'api/'

// Main Serverless Function Handler
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensure it's the expected method
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "POST, GET, OPTIONS");
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Connect to MongoDB first
    await connectDB();

    const { email } = req.body; // Assuming email is sent in the body

    // Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Find the user's order data by email
    let myData = await Order.findOne({ 'email': email });

    // If no data found, return empty array or appropriate message
    if (!myData) {
        return res.status(404).json({ success: true, message: 'No orders found for this email', orderData: [] });
    }

    res.status(200).json({ success: true, orderData: myData }); // Send the found order data

  } catch (error) {
    console.error('Error fetching order data in /api/myOrderData:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
      details: error.message
    });
  }
};