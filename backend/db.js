
const mongoose = require("mongoose");

  const mongoURI = process.env.MONGODB_URI;

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
      global.foodItems = productsData;
      global.foodCategories = categoriesData;
    } else {
      global.foodItems = [];
      global.foodCategories = categoriesData; // Still set categories even if no products
    }

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit the application if database connection fails
  }
};

module.exports = mongoDB;