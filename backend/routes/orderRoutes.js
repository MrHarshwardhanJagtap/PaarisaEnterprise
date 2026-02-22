const express = require('express');
const router = express.Router();
// Import the new controller function
const { createOrder, getOrders, deleteOrder, updateOrderStatus } = require('../controllers/orderController');

router.route('/').post(createOrder);
router.route('/:userId').get(getOrders);

router.route('/:id')
    .delete(deleteOrder)
    .put(updateOrderStatus); // NEW: Add PUT route for updating status

module.exports = router;