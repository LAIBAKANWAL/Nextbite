
const mongoose = require("mongoose");

const mongoURI = process.env.MONGODB_URI;

// Optimize for serverless - use connection pooling
const options = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

let isConnected = false;

const mongoDB = async () => {
  if (isConnected) {
    console.log("📡 Using existing MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(mongoURI, options);
    isConnected = true;
    console.log("✅ Connected to MongoDB Atlas successfully!");

    // Get the collections
    const productsCollection = mongoose.connection.db.collection("products");
    const categoriesCollection = mongoose.connection.db.collection("categories");

    // Fetch data using async/await (modern approach)
    const [productsData, categoriesData] = await Promise.all([
      productsCollection.find({}).toArray(),
      categoriesCollection.find({}).toArray()
    ]);

    global.foodItems = productsData;
    global.foodCategories = categoriesData;
    
    console.log(`📦 Loaded ${productsData.length} food items and ${categoriesData.length} categories`);
    console.log("🔍 Sample category:", categoriesData[0]);
    console.log("🔍 Sample product:", productsData[0]);
    console.log("🔍 Categories field names:", categoriesData.length > 0 ? Object.keys(categoriesData[0]) : "No categories");
    console.log("🔍 Products field names:", productsData.length > 0 ? Object.keys(productsData[0]) : "No products");

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    isConnected = false;
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  isConnected = false;
});

module.exports = mongoDB;

