const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  try {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    console.log("🔍 Starting foodData function");
    console.log("🔍 MONGODB_URI exists:", !!process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found");
      return res.status(500).json({
        success: false,
        message: "Database configuration error",
        error: "MONGODB_URI environment variable is not set"
      });
    }

    // Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...");
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const db = client.db();
    
    // Get products collection
    const productsCollection = db.collection("products");
    console.log("📦 Fetching products...");
    
    const products = await productsCollection.find({}).toArray();
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length > 0) {
      console.log("🔍 Sample product:", JSON.stringify(products[0], null, 2));
    }

    await client.close();
    console.log("🔒 MongoDB connection closed");

    return res.status(200).json({
      success: true,
      data: products,
      debug: {
        productsCount: products.length,
        hasMongoUri: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ FATAL ERROR in foodData:", error);
    console.error("❌ Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};