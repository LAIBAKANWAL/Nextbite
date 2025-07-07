const express = require("express");
const router = express.Router();

router.post("/foodData", async (req, res) => {
  try {
    res.send([global.foodItems,global.foodCategories]);

  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
