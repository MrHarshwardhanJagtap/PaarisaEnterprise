const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.route('/').post(createProduct);
router.route('/:userId').get(getProducts);
router.route('/:id')
  .put(updateProduct)   // Added PUT route
  .delete(deleteProduct);

module.exports = router;