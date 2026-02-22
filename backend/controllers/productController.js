const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

// @desc    Get all products for a specific user
// @route   GET /api/products/:userId
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.params.userId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
  const { ownerId, name, cost, stock } = req.body;
  try {
    const product = await Product.create({
      ownerId,
      name,
      cost,
      stock,
      lastUpdated: new Date()
    });

    // Create stock log entry for new product
    await StockLog.create({
      ownerId,
      productId: product._id,
      productName: name,
      type: 'ADD',
      quantityChange: stock,
      previousStock: 0,
      newStock: stock,
      previousCost: 0,
      newCost: cost,
      detail: 'Stock Initialized',
      timestamp: new Date()
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  const { name, cost, stock } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Store previous values for logging
      const previousStock = product.stock;
      const previousCost = product.cost;
      const previousName = product.name;

      // Update product fields
      product.name = name || product.name;
      product.cost = cost !== undefined ? cost : product.cost;
      product.stock = stock !== undefined ? stock : product.stock;
      product.lastUpdated = new Date();

      const updatedProduct = await product.save();

      // Create stock log entry if stock or cost changed
      if (previousStock !== product.stock || previousCost !== product.cost) {
        const stockChange = product.stock - previousStock;
        const details = [];

        if (previousStock !== product.stock) {
          details.push(`Stock ${stockChange > 0 ? 'added' : 'reduced'}: ${Math.abs(stockChange)} units`);
        }
        if (previousCost !== product.cost) {
          details.push(`Cost changed: ₹${previousCost.toFixed(2)} → ₹${product.cost.toFixed(2)}`);
        }
        if (previousName !== product.name) {
          details.push(`Name updated`);
        }

        await StockLog.create({
          ownerId: product.ownerId,
          productId: product._id,
          productName: product.name,
          type: 'EDIT',
          quantityChange: stockChange,
          previousStock,
          newStock: product.stock,
          previousCost,
          newCost: product.cost,
          detail: details.join(', '),
          timestamp: new Date()
        });
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };