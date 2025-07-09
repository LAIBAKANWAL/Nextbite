// File: NetxBite-Frontend-Repo/api/orderData.js

const { MongoClient } = require('mongodb');

// Main Serverless Function Handler
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

    console.log("🔍 Starting orderData function");
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: "Database configuration error"
      });
    }

    const { email, orderData, orderDate } = req.body;

    // Validate required fields
    if (!email || !orderData || !Array.isArray(orderData) || orderData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email and orderData are required, and orderData must be a non-empty array'
      });
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB for order");
    
    const db = client.db();
    const ordersCollection = db.collection("orders");

    // Create the new order object with date
    const newOrderEntry = {
      orderDate: orderDate || new Date().toDateString(),
      items: orderData
    };

    // Use updateOne with upsert to either update existing or create new
    const result = await ordersCollection.updateOne(
      { email: email },
      {
        $push: {
          orderData: newOrderEntry
        }
      },
      { upsert: true }
    );

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      orderId: result.upsertedId || 'updated'
    });

  } catch (error) {
    console.error('❌ Error in orderData:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error: error.message
    });
  }
};