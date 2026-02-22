const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getHistory, clearHistory, updateProfile } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/history/:id', getHistory);
router.delete('/history/:id', clearHistory); // Add this line
router.put('/profile/:id', updateProfile);

module.exports = router;