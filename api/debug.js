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

    console.log("🔍 Starting comprehensive database debug");
    
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
    console.log("✅ Connected to MongoDB for debugging");
    
    const db = client.db();
    const dbInfo = {
      databaseName: db.databaseName,
      collections: [],
      totalDocuments: 0
    };
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log("📂 Found collections:", collections.map(c => c.name));
    
    // Analyze each collection
    for (const collection of collections) {
      try {
        const coll = db.collection(collection.name);
        const count = await coll.countDocuments();
        const sample = count > 0 ? await coll.findOne() : null;
        
        const collectionInfo = {
          name: collection.name,
          documentCount: count,
          sampleDocument: sample,
          fields: sample ? Object.keys(sample) : []
        };
        
        dbInfo.collections.push(collectionInfo);
        dbInfo.totalDocuments += count;
        
        console.log(`📊 Collection '${collection.name}': ${count} documents`);
        if (sample) {
          console.log(`🔍 Sample from '${collection.name}':`, JSON.stringify(sample, null, 2));
          console.log(`🏷️ Fields in '${collection.name}':`, Object.keys(sample));
        }
      } catch (error) {
        console.error(`❌ Error analyzing collection '${collection.name}':`, error.message);
        dbInfo.collections.push({
          name: collection.name,
          error: error.message
        });
      }
    }
    
    // Look for food-related data specifically
    const foodCollections = collections.filter(c => 
      c.name.toLowerCase().includes('food') || 
      c.name.toLowerCase().includes('product') || 
      c.name.toLowerCase().includes('item') ||
      c.name.toLowerCase().includes('menu') ||
      c.name.toLowerCase().includes('dish')
    );
    
    console.log("🍽️ Food-related collections:", foodCollections.map(c => c.name));

    await client.close();
    console.log("🔒 Debug connection closed");

    return res.status(200).json({
      success: true,
      debug: {
        message: "Complete database analysis",
        database: dbInfo,
        foodRelatedCollections: foodCollections.map(c => c.name),
        recommendations: {
          likelyProductCollection: dbInfo.collections
            .filter(c => c.documentCount > 0)
            .sort((a, b) => b.documentCount - a.documentCount)[0]?.name,
          collectionsWithData: dbInfo.collections
            .filter(c => c.documentCount > 0)
            .map(c => ({ name: c.name, count: c.documentCount }))
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Debug error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Debug error",
      error: error.message
    });
  }
};