const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true  // Keep unique to have one document per email
  },
  orderData: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('orders', orderSchema);