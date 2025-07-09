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

    console.log("🔍 Starting foodCategory function");
    console.log("🔍 Environment variables check:");
    console.log("  - NODE_ENV:", process.env.NODE_ENV);
    console.log("  - MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("  - MONGODB_URI length:", process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
    
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found in environment variables");
      return res.status(500).json({
        success: false,
        message: "Database configuration error",
        error: "MONGODB_URI environment variable is not set"
      });
    }

    // Test MongoDB connection
    console.log("🔄 Attempting to connect to MongoDB...");
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Successfully connected to MongoDB");
    
    const db = client.db();
    console.log("📋 Database name:", db.databaseName);
    
    // Get categories collection
    const categoriesCollection = db.collection("categories");
    console.log("📦 Attempting to fetch categories...");
    
    const categories = await categoriesCollection.find({}).toArray();
    console.log(`✅ Found ${categories.length} categories`);
    
    if (categories.length > 0) {
      console.log("🔍 Sample category:", JSON.stringify(categories[0], null, 2));
    }

    await client.close();
    console.log("🔒 MongoDB connection closed successfully");

    return res.status(200).json({
      success: true,
      data: categories,
      debug: {
        categoriesCount: categories.length,
        hasMongoUri: true,
        timestamp: new Date().toISOString(),
        dbName: db.databaseName
      }
    });

  } catch (error) {
    console.error("❌ FATAL ERROR in foodCategory:", error);
    console.error("❌ Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};