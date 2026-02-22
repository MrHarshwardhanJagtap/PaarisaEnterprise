const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

// @desc    Register a new user
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, password, role });
    res.status(201).json({ _id: user._id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user & log history
const loginUser = async (req, res) => {
  const { username, password, deviceType, userAgent } = req.body;
  try {
    const user = await User.findOne({ username });
    
    if (user && user.password === password) {
      await LoginHistory.create({ userId: user._id, deviceType, userAgent });
      res.json({ id: user._id, username: user.username, role: user.role });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Login History
const getHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({ userId: req.params.id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all login history
const clearHistory = async (req, res) => {
  try {
    await LoginHistory.deleteMany({ userId: req.params.id });
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATED: @desc Update user profile with security check
// @route PUT /api/auth/profile/:id
const updateProfile = async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // 1. Update Username
      user.username = username || user.username;

      // 2. Update Password (only if verified)
      if (newPassword) {
        // SECURITY: Verify current password first
        if (user.password !== currentPassword) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
        user.password = newPassword;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getHistory, clearHistory, updateProfile };