const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  try {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    console.log("🧪 Testing MongoDB connection for login");
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        error: "MONGODB_URI not set"
      });
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB for login test");
    
    const db = client.db();
    
    // Test collections
    const collections = await db.listCollections().toArray();
    const usersCollection = db.collection("users");
    const userCount = await usersCollection.countDocuments();
    
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`👥 Users collection has ${userCount} documents`);
    
    await client.close();

    return res.status(200).json({
      success: true,
      message: "Login test successful",
      database: db.databaseName,
      collections: collections.map(c => c.name),
      userCount: userCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Login test error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Login test failed",
      error: error.message
    });
  }
};