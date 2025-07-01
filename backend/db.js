const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://nextbite_app:laiba12345678@nextbitecluster.lt9ower.mongodb.net/nextbite_db?retryWrites=true&w=majority&appName=NextBiteCluster";

const mongoDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB Atlas successfully!");

    // Get the collections
    const productsCollection = mongoose.connection.db.collection("products");
    const categoriesCollection = mongoose.connection.db.collection("categories");

    // Fetch data using async/await (modern approach)
    const [productsData, categoriesData] = await Promise.all([
      productsCollection.find({}).toArray(),
      categoriesCollection.find({}).toArray()
    ]);

    if (productsData.length > 0) {
      console.log(`📦 Found ${productsData.length} products`);
      global.foodItems = productsData;
      global.foodCategories = categoriesData;
      console.log(`📂 Found ${categoriesData.length} categories`);
    } else {
      console.log("⚠️ No products found in the collection");
      global.foodItems = [];
      global.foodCategories = categoriesData; // Still set categories even if no products
    }

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit the application if database connection fails
  }
};

module.exports = mongoDB;