// File: NetxBite-Frontend-Repo/api/forgotPassword.js

require("dotenv").config();

const connectDB = require("./db");
const User = require("./models/User");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");

// Validation rules for forgot password
const validateForgotPassword = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

// Middleware runner for express-validator
const runValidation = async (req) => {
  for (let validation of validateForgotPassword) {
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

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: "If this email exists in our system, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // In a real application, you would send an email here
    // For demo purposes, we'll return the reset token
    
    return res.status(200).json({
      success: true,
      message: "Password reset instructions have been sent to your email.",
      // Remove this in production - only for demo
      resetToken: resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    });

  } catch (error) {
    console.error("Error in /api/forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      details: error.message
    });
  }
};