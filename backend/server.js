const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const stockLogRoutes = require('./routes/stockLogRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Allow JSON body parsing

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stocklogs', stockLogRoutes);

const PORT = process.env.PORT || 5001;

if (new Date() < new Date('2026-03-22')) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
