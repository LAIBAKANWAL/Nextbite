const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://nextbite_app:laiba12345678@nextbitecluster.lt9ower.mongodb.net/nextbite_db?retryWrites=true&w=majority&appName=NextBiteCluster";

const mongoDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB Atlas successfully!");
    // const fetchedData = await mongoose.connection.db.collection("products");
    // fetchedData.find({}).toArray(function(err, data){
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log(data);
    //   }
    // });


     // Get the collection
    const collection = mongoose.connection.db.collection("products");
    
    // Fetch data using async/await (modern approach)
    const data = await collection.find({}).toArray();
    
    if (data.length > 0) {
      // console.log("📦 Products data:", data);
      console.log(`Found ${data.length} products`);
    } else {
      console.log("⚠️ No products found in the collection");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit the application if database connection fails
  }
};

module.exports = mongoDB;
