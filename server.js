const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Profile = require('./models/Profile');
require('dotenv').config();
const bcrypt = require('bcryptjs');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your React app
  credentials: true, // Allow sending cookies, authorization headers, etc.
  allowedHeaders: ['Authorization', 'Content-Type'], // Specify allowed headers
}));
app.use(express.json());


// Routes
const profileRoutes = require('./routes/profileRoutes');
const courseRoutes = require('./routes/courseRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const reviewRoutes = require('./routes/reviewRoute');
const messageRoutes = require('./routes/messageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponRoutes = require('./routes/couponRoutes');

app.use('/api/profile', profileRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
.then(() => {
  console.log('MongoDB Connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err));
