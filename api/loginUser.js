// File: NetxBite-Frontend-Repo/api/loginUser.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

const { MongoClient } = require('mongodb');
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

module.exports = async (req, res) => {
  try {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
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

    console.log("🔍 Starting loginUser function");
    
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found");
      return res.status(500).json({
        success: false,
        message: "Database configuration error"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not found");
      return res.status(500).json({
        success: false,
        message: "Authentication configuration error"
      });
    }

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
    console.log("🔍 Login attempt for email:", email);

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB for login");
    
    const db = client.db();
    const usersCollection = db.collection("users");

    // Find user by email
    const userData = await usersCollection.findOne({ email: email });
    console.log("🔍 User found:", !!userData);

    if (!userData) {
      await client.close();
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    console.log("🔍 Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      await client.close();
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const data = {
      user: {
        id: userData._id.toString(),
      },
    };

    const authToken = jwt.sign(data, process.env.JWT_SECRET);
    console.log("✅ Login successful for user:", userData.name);

    await client.close();

    return res.json({
      success: true,
      message: "Login successful",
      authToken: authToken,
      user: {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email
      }
    });

  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message
    });
  }
};