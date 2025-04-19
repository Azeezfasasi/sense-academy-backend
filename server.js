// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const Profile = require('./models/Profile');
// require('dotenv').config();
// const bcrypt = require('bcryptjs');
// const cookieParser = require('cookie-parser');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cookieParser()); // Enable cookie-parser middleware
// app.use(cors({
//   origin: [
//     'https://sense-academy.netlify.app', // Hosted frontend
//     'http://localhost:5173', // Local frontend
//   ],
//   credentials: true, // Allow sending cookies, authorization headers, etc.
//   allowedHeaders: ['Authorization', 'Content-Type'], // Specify allowed headers
// }));


// // Routes
// const profileRoutes = require('./routes/profileRoutes');
// const courseRoutes = require('./routes/courseRoutes');
// const certificateRoutes = require('./routes/certificateRoutes');
// const assessmentRoutes = require('./routes/assessmentRoutes');
// const reviewRoutes = require('./routes/reviewRoute');
// const messageRoutes = require('./routes/messageRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const wishlistRoutes = require('./routes/wishlistRoutes');
// const couponRoutes = require('./routes/couponRoutes');
// const paymentRoutes = require("./routes/paymentRoutes");

// app.use('/api/profile', profileRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/certificates', certificateRoutes);
// app.use('/api/assessments', assessmentRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/wishlist', wishlistRoutes);
// app.use('/api/coupons', couponRoutes);
// app.use("/api/payments", paymentRoutes);

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {})
// .then(() => {
//   console.log('MongoDB Connected');
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// })
// .catch((err) => console.error('MongoDB connection error:', err));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'https://sense-academy.netlify.app',
    'http://localhost:5173',
  ],
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

// Routes
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoute'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
