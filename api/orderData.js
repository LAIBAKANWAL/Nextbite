// File: NetxBite-Frontend-Repo/api/orderData.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

// Database connection
const connectDB = require("./db"); // Adjust path if db.js is not directly in 'api/'
const Order = require("./models/Orders"); // Adjust path to your Order model relative to 'api/'

// Connect to MongoDB
connectDB();

// Main Serverless Function Handler
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensure it's a POST request
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, orderData, orderDate } = req.body;

    // Validate required fields
    if (!email || !orderData || !Array.isArray(orderData) || orderData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email and orderData are required, and orderData must be a non-empty array'
      });
    }

    // Create the new order object with date
    const newOrderEntry = {
      orderDate: orderDate || new Date().toDateString(), // Use provided date or current date
      items: orderData
    };

    // Use findOneAndUpdate with upsert to either update existing or create new
    const updatedOrder = await Order.findOneAndUpdate(
      { email: email }, // Find document with this email
      {
        $push: {
          orderData: newOrderEntry // Add new order to orderData array
        }
      },
      {
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      orderId: updatedOrder._id
    });

  } catch (error) {
    console.error('Error saving order in /api/orderData:', error); // Better error logging for Vercel
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
      details: error.message // Include error message for debugging (remove in production if sensitive)
    });
  }
};