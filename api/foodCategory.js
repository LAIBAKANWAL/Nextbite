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
    
    // Get categories collection
    const categoriesCollection = db.collection("categories");
    const categories = await categoriesCollection.find({}).toArray();

    console.log(`� Found ${categories.length} categories`);
    console.log("🔍 Sample category:", categories[0]);

    res.status(200).json({
      success: true,
      data: categories,
      debug: {
        categoriesCount: categories.length,
        hasMongoUri: !!process.env.MONGODB_URI,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error in foodCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  } finally {
    // Close connection
    await client.close();
  }
}