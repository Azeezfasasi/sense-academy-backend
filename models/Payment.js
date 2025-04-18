const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true }, // Reference to the user who made the payment
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // List of purchased courses
  totalAmount: { type: Number, required: true }, // Total payment amount
  paymentStatus: { type: String, enum: ["Paid", "Pending"], default: "Pending" }, // Payment status
  paymentDate: { type: Date, default: Date.now }, // Date of payment
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);