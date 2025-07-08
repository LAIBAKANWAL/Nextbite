// File: NetxBite-Frontend-Repo/api/foodCategory.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

// Database connection
const connectDB = require("./db"); // Adjust path if db.js is not directly in 'api/'
const FoodCategory = require("./models/FoodCategory"); // Assuming you have a FoodCategory model
                                                     // Adjust path to your FoodCategory model relative to 'api/'

// Connect to MongoDB
connectDB();

// Main Serverless Function Handler
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS"); // Assuming your frontend uses POST, but GET is more common for data fetching
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensure it's the expected method
  if (req.method !== "POST" && req.method !== "GET") { // Allow both POST and GET for data fetching flexibility
    res.setHeader("Allow", "POST, GET, OPTIONS");
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Fetch food categories directly from MongoDB
    const foodCategories = await FoodCategory.find({}); // Fetch all food categories from your collection

    res.status(200).json({ success: true, data: foodCategories }); // Send the food categories
  } catch (error) {
    console.error("Error in /api/foodCategory:", error); // Log the actual error for debugging
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching food categories",
      details: error.message // Include error message for debugging (remove in production if sensitive)
    });
  }
};