
const mongoose = require("mongoose");

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  throw new Error("MONGODB_URI environment variable is required");
}

// Optimize for serverless - use connection pooling
const options = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  // Prevent mongoose from closing connection
  keepAlive: true,
  keepAliveInitialDelay: 300000
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const mongoDB = async () => {
  if (cached.conn) {
    console.log("📡 Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🔌 Creating new MongoDB connection...");
    cached.promise = mongoose.connect(mongoURI, options).then((mongoose) => {
      console.log("✅ Connected to MongoDB Atlas successfully!");
      return mongoose;
    }).catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Get the collections and set global data
    const db = cached.conn.connection.db;
    console.log("📂 Database name:", db.databaseName);
    
    const productsCollection = db.collection("products");
    const categoriesCollection = db.collection("categories");

    // Fetch data using async/await (modern approach)
    const [productsData, categoriesData] = await Promise.all([
      productsCollection.find({}).toArray(),
      categoriesCollection.find({}).toArray()
    ]);

    console.log(`🔍 Found ${productsData.length} products and ${categoriesData.length} categories`);

    if (productsData.length > 0) {
      global.foodItems = productsData;
      global.foodCategories = categoriesData;
      console.log(`📦 Loaded ${productsData.length} food items and ${categoriesData.length} categories`);
    } else {
      global.foodItems = [];
      global.foodCategories = categoriesData || [];
      console.log("⚠️ No products found, using empty array");
    }

    return cached.conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (error.name === 'MongoNetworkError') {
      console.error("🌐 Network error - check your internet connection and MongoDB Atlas whitelist");
    }
    if (error.name === 'MongoServerSelectionError') {
      console.error("🔒 Server selection error - check your connection string and credentials");
    }
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};

module.exports = mongoDB;

