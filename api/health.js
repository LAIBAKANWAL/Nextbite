// Health check endpoint for testing deployment
require("dotenv").config();

const connectDB = require("./db");

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test database connection
    await connectDB();
    
    const dbStatus = {
      connected: true,
      foodItems: (global.foodItems && global.foodItems.length) || 0,
      foodCategories: (global.foodCategories && global.foodCategories.length) || 0
    };

    res.status(200).json({
      success: true,
      message: "NextBite API is healthy! 🚀",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      version: "1.0.0"
    });

  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};