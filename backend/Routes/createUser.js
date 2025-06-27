const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const user = require("../models/User");

// Validation rules
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
    .normalizeEmail()
    .custom(async (email) => {
      // Check if email already exists
      const existingUser = await user.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }
      return true;
    }),

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

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

// Validation rules for login
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/createuser", validateUser, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, address, password, confirmPassword } = req.body;

    await user.create({
      name: name,
      email: email,
      address: address,
      password: password,
      confirmPassword: confirmPassword,
    });

    res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
});

router.post("/loginuser", validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;

    // Find user by email
    const userData = await user.findOne({ email });
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (password !== userData.password) {
      return res.status(401).json({
        errors: "Try logging with correct credentials",
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
});

module.exports = router;
