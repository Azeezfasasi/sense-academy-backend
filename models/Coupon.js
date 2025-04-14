const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  type: { type: String, enum: ['Percentage', 'Fixed'] },
  expiryDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Optional: Apply to specific courses
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
