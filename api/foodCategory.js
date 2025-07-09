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
    console.log("✅ Connected to MongoDB");
    
    const db = client.db();
    
    // Get products collection and extract unique categories
    const productsCollection = db.collection("products");
    console.log("📦 Fetching products to extract categories...");
    
    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`📊 Found ${products.length} products`);
    
    // Extract unique category names
    const uniqueCategories = [...new Set(products.map(product => product.categoryName).filter(Boolean))];
    console.log("�️ Unique categories found:", uniqueCategories);
    
    // Create category objects
    const categories = uniqueCategories.map(categoryName => ({
      categoryName: categoryName,
      _id: categoryName.toLowerCase().replace(/\s+/g, '-'), // Create a simple ID
    }));
    
    console.log(`✅ Created ${categories.length} category objects`);
    console.log("🔍 Sample category:", JSON.stringify(categories[0], null, 2));

    await client.close();
    console.log("🔒 MongoDB connection closed");

    return res.status(200).json({
      success: true,
      data: categories,
      debug: {
        categoriesCount: categories.length,
        totalProducts: products.length,
        uniqueCategoryNames: uniqueCategories,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error in foodCategory:", error);
    
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};