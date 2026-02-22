const mongoose = require('mongoose');

const stockLogSchema = mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  type: { type: String, enum: ['ADD', 'EDIT', 'SALE'], required: true },
  quantityChange: { type: Number, required: true }, // positive for add, negative for sale
  previousStock: { type: Number },
  newStock: { type: Number, required: true },
  previousCost: { type: Number },
  newCost: { type: Number, required: true },
  detail: { type: String }, // Additional details like "Order by Customer X" or "Stock adjustment"
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
