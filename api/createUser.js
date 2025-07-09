// File: NetxBite-Frontend-Repo/api/createUser.js

// Load environment variables (useful for local `vercel dev` testing)
require("dotenv").config();

const { MongoClient } = require('mongodb');
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

    console.log("🔍 Starting createUser function");
    
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found");
      return res.status(500).json({
        success: false,
        message: "Database configuration error"
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

    const { name, email, address, password } = req.body;
    console.log("🔍 Creating user with email:", email);

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB for user creation");
    
    const db = client.db();
    const usersCollection = db.collection("users");

    // Check for existing email
    const existingUser = await usersCollection.findOne({ email: email });
    if (existingUser) {
      await client.close();
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const secPassword = await bcrypt.hash(password, salt);

    // Create user document
    const newUser = {
      name: name,
      email: email,
      address: address,
      password: secPassword,
      date: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    console.log("✅ User created successfully with ID:", result.insertedId);

    await client.close();

    return res.status(201).json({ 
      success: true, 
      message: "User created successfully",
      userId: result.insertedId.toString()
    });

  } catch (error) {
    console.error("❌ Error in createUser:", error);
    
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message
    });
  }
};