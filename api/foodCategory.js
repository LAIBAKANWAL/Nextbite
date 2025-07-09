// File: NetxBite-Frontend-Repo/api/foodCategory.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

// Database connection
const connectDB = require("./db");

// Connect to MongoDB
connectDB();

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
    // Use global variables set by db.js
    const foodCategories = global.foodCategories || [];

    res.status(200).json({ 
      success: true, 
      data: foodCategories 
    });
  } catch (error) {
    console.error("Error in /api/foodCategory:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching food categories",
      details: error.message
    });
  }
};