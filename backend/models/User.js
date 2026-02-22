  const mongoose = require('mongoose');

  const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In real app, hash this!
    role: { 
      type: String, 
      required: true, 
      enum: ['MANUFACTURER', 'DISTRIBUTOR'] 
    }
  }, { timestamps: true });

  module.exports = mongoose.model('User', userSchema);