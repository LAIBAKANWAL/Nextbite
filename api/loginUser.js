// File: NetxBite-Frontend-Repo/api/loginUser.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

// Database connection
const connectDB = require("./db"); // Adjust path if db.js is not directly in 'api/'
const User = require("./models/User"); // Adjust path to your User model relative to 'api/'

// Validation utilities
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// JWT Secret (MUST be set as an environment variable in Vercel Dashboard)
const jwtSecret = process.env.JWT_SECRET; // Renamed to JWT_SECRET for clarity

// Validation rules for login
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Middleware runner for express-validator in a serverless context
const runValidation = async (req) => {
  for (let validation of validateLogin) {
    await validation.run(req);
  }
  return validationResult(req);
};

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
    // Connect to MongoDB first
    await connectDB();

    // Run validations
    const errors = await runValidation(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const data = {
      user: {
        id: userData.id,
      },
    };

    // Ensure jwtSecret is available in Vercel Environment Variables
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is not set.");
    }
    const authToken = jwt.sign(data, jwtSecret);

    return res.json({
      success: true,
      message: "Login successful",
      authToken: authToken,
    });
  } catch (error) {
    console.error("Error in /api/loginUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      details: error.message
    });
  }
};