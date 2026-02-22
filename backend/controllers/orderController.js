const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order with MULTIPLE items and update stock
// @route   POST /api/orders
const createOrder = async (req, res) => {
  // UPDATED: Destructure 'status' to save payment status
  const { fromId, toName, items, type, date, status } = req.body;
  
  try {
    let orderTotalAmount = 0;
    let orderTotalProfit = 0;
    const processedItems = [];

    // Loop through each item in the request
    for (const item of items) {
      const product = await Product.findById(item.bottleId);
      
      if (!product) {
        throw new Error(`Product not found for ID: ${item.bottleId}`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      // Calculations
      const costPrice = product.cost;
      const subTotal = item.unitPrice * item.quantity;
      const itemProfit = (item.unitPrice - costPrice) * item.quantity;

      // Update Order Totals
      orderTotalAmount += subTotal;
      orderTotalProfit += itemProfit;

      // Push to processed items array
      processedItems.push({
        bottleId: item.bottleId,
        bottleName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subTotal: subTotal,
        itemProfit: itemProfit
      });

      // Deduct Stock
      product.stock = product.stock - item.quantity;
      await product.save();
    }

    // Create the Order
    const order = await Order.create([{
      fromId,
      toName,
      type,
      items: processedItems,
      totalAmount: orderTotalAmount,
      totalProfit: orderTotalProfit,
      date: date ? new Date(date) : new Date(),
      // UPDATED: Save status (Pending/Completed) or default to Pending
      status: status || 'Pending' 
    }]);

    res.status(201).json(order[0]);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/:userId
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ fromId: req.params.userId }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete order and RESTORE stock for ALL items
// @route   DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Restore stock for every item in the order
    for (const item of order.items) {
      const product = await Product.findById(item.bottleId);
      if (product) {
        product.stock = product.stock + item.quantity;
        await product.save();
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: 'Order deleted and stock restored' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: @desc Update order status (Payment Pending/Completed)
// @route PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, deleteOrder, updateOrderStatus };