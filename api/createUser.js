// File: NetxBite-Frontend-Repo/api/createUser.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

// Database connection
const connectDB = require("./db"); // Adjust path if db.js is not directly in 'api/'
const User = require("./models/User"); // Adjust path to your User model relative to 'api/'

// Validation utilities from express-validator (adapted for serverless)
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

// Validation rules as a reusable array
const validateUser = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters")
    .trim(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Middleware runner for express-validator in a serverless context
const runValidation = async (req) => {
  for (let validation of validateUser) {
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

    const { name, email, address, password } = req.body;

    // Custom check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email already in use"
        });
    }

    const salt = await bcrypt.genSalt(12);
    const secPassword = await bcrypt.hash(password, salt);

    await User.create({
      name: name,
      email: email,
      address: address,
      password: secPassword,
    });

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error in /api/createUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      details: error.message
    });
  }
};