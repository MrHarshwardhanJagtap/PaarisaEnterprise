const StockLog = require('../models/StockLog');

// @desc    Get all stock logs for a specific user
// @route   GET /api/stocklogs/:userId
const getStockLogs = async (req, res) => {
  try {
    const logs = await StockLog.find({ ownerId: req.params.userId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a stock log entry
// @route   POST /api/stocklogs
const createStockLog = async (req, res) => {
  const { ownerId, productId, productName, type, quantityChange, previousStock, newStock, previousCost, newCost, detail } = req.body;
  try {
    const log = await StockLog.create({
      ownerId,
      productId,
      productName,
      type,
      quantityChange,
      previousStock,
      newStock,
      previousCost,
      newCost,
      detail,
      timestamp: new Date()
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a stock log (if needed)
// @route   DELETE /api/stocklogs/:id
const deleteStockLog = async (req, res) => {
  try {
    const log = await StockLog.findById(req.params.id);
    if (log) {
      await log.deleteOne();
      res.json({ message: 'Stock log removed' });
    } else {
      res.status(404).json({ message: 'Stock log not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStockLogs, createStockLog, deleteStockLog };
