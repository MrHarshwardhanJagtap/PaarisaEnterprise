const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  // 'cost' covers productionCost (Manufacturer) or purchasePrice (Distributor)
  cost: { type: Number, required: true }, 
  stock: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);