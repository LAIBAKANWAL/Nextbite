import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    
    // Get products collection
    const productsCollection = db.collection("products");
    const products = await productsCollection.find({}).toArray();

    console.log(`📦 Found ${products.length} products`);
    console.log("🔍 Sample product:", products[0]);

    res.status(200).json({
      success: true,
      data: products,
      debug: {
        productsCount: products.length,
        hasMongoUri: !!process.env.MONGODB_URI,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error in foodData:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  } finally {
    // Close connection
    await client.close();
  }
}