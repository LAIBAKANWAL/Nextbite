const express = require('express');
const router = express.Router();
const Order = require('../models/Orders'); // Adjust path as needed

router.post('/orderData', async (req, res) => {
  try {
    console.log('Received order data:', req.body); // Debug log
    
    const { email, orderData, orderDate } = req.body;
    
    // Validate required fields
    if (!email || !orderData || !Array.isArray(orderData) || orderData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and orderData are required, and orderData must be a non-empty array' 
      });
    }
    
    // Create the new order object with date
    const newOrderEntry = {
      orderDate: orderDate || new Date().toDateString(),
      items: orderData
    };
    
    // Use findOneAndUpdate with upsert to either update existing or create new
    const updatedOrder = await Order.findOneAndUpdate(
      { email: email }, // Find document with this email
      { 
        $push: { 
          orderData: newOrderEntry  // Add new order to orderData array
        } 
      },
      { 
        new: true,        // Return updated document
        upsert: true,     // Create if doesn't exist
        setDefaultsOnInsert: true
      }
    );
    
    console.log('Order saved/updated successfully:', updatedOrder); // Debug log
    
    res.status(200).json({ 
      success: true, 
      message: 'Order placed successfully',
      orderId: updatedOrder._id
    });
    
  } catch (error) {
    console.error('Error saving order:', error); // Better error logging
    res.status(500).json({ 
      success: false, 
      message: 'Server Error: ' + error.message 
    });
  }
});



router.post('/myorderData', async (req, res) => {
  try {
     let myData = await Order.findOne({'email': req.body.email})
     res.json({orderData:myData})
  } catch (error) {
    console.error('Error saving order:', error); // Better error logging
    res.status(500).json({ 
      success: false, 
      message: 'Server Error: ' + error.message 
    });
  }
})
   
module.exports = router;