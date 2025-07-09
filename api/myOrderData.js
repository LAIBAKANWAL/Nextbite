// File: NetxBite-Frontend-Repo/api/myOrderData.js

const { MongoClient } = require('mongodb');

// Main Serverless Function Handler
module.exports = async (req, res) => {
  try {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
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

    console.log("🔍 Starting myOrderData function");
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: "Database configuration error"
      });
    }

    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB for order data");
    
    const db = client.db();
    const ordersCollection = db.collection("orders");

    // Find the user's order data by email
    const myData = await ordersCollection.findOne({ email: email });

    await client.close();

    // If no data found, return empty array
    if (!myData) {
      return res.status(200).json({ 
        success: true, 
        message: 'No orders found for this email', 
        orderData: [] 
      });
    }

    return res.status(200).json({ 
      success: true, 
      orderData: myData 
    });

  } catch (error) {
    console.error('❌ Error in myOrderData:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error: error.message
    });
  }
};