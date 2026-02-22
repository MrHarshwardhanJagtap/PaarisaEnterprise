const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bottleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  bottleName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  itemProfit: { type: Number, required: true }
});

const orderSchema = mongoose.Schema({
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toName: { type: String, required: true }, 
  type: { type: String, enum: ['M2D', 'D2S'], required: true }, 
  
  items: [orderItemSchema],
  
  totalAmount: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  
  // UPDATED: Default to 'Pending' so new orders aren't assumed paid
  status: { type: String, default: 'Pending' }, 
  
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);