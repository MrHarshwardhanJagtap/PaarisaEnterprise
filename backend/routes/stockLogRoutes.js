const express = require('express');
const router = express.Router();
const { getStockLogs, createStockLog, deleteStockLog } = require('../controllers/stockLogController');

router.route('/').post(createStockLog);
router.route('/:userId').get(getStockLogs);
router.route('/:id').delete(deleteStockLog);

module.exports = router;
