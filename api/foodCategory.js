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
    console.log("✅ Successfully connected to MongoDB");
    
    const db = client.db();
    console.log("📋 Database name:", db.databaseName);
    
    // Check what collections exist
    const collections = await db.listCollections().toArray();
    console.log("📂 Available collections:", collections.map(c => c.name));
    
    // Try different possible collection names
    const possibleNames = ['categories', 'category', 'Categories', 'Category', 'foodCategories'];
    let categories = [];
    let usedCollectionName = '';
    
    for (const collectionName of possibleNames) {
      try {
        console.log(`� Trying collection: ${collectionName}`);
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`📊 Collection '${collectionName}' has ${count} documents`);
        
        if (count > 0) {
          categories = await collection.find({}).toArray();
          usedCollectionName = collectionName;
          console.log(`✅ Found data in collection: ${collectionName}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error checking collection '${collectionName}':`, error.message);
      }
    }
    
    if (categories.length > 0) {
      console.log("🎉 Categories found!");
      console.log("🔍 Sample category:", JSON.stringify(categories[0], null, 2));
      console.log("🔍 Category fields:", Object.keys(categories[0]));
    } else {
      console.log("❌ No categories found in any collection");
      console.log("🔍 Available collections:", collections.map(c => c.name));
      
      // Check if collections have any data at all
      for (const collection of collections) {
        try {
          const coll = db.collection(collection.name);
          const count = await coll.countDocuments();
          const sample = await coll.findOne();
          console.log(`📊 Collection '${collection.name}': ${count} documents`);
          if (sample) {
            console.log(`🔍 Sample from '${collection.name}':`, JSON.stringify(sample, null, 2));
          }
        } catch (error) {
          console.log(`❌ Error checking '${collection.name}':`, error.message);
        }
      }
    }

    await client.close();
    console.log("🔒 MongoDB connection closed");

    return res.status(200).json({
      success: true,
      data: categories,
      debug: {
        categoriesCount: categories.length,
        usedCollectionName: usedCollectionName,
        availableCollections: collections.map(c => c.name),
        databaseName: db.databaseName,
        timestamp: new Date().toISOString()
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