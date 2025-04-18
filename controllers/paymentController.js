const Payment = require("../models/Payment");
const Profile = require("../models/Profile");
const Course = require("../models/Course");

// Create a new payment record
const createPayment = async (req, res) => {
  try {
    const { courses, totalAmount } = req.body;
    const userId = req.user.id; // Get the logged-in user's ID

    const payment = new Payment({
      user: userId,
      courses,
      totalAmount,
      paymentStatus: "Paid", // Assuming payment is successful
    });

    await payment.save();

    res.status(201).json({ message: "Payment recorded successfully", payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch payment history for a student
const fetchStudentPayments = async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user's ID
    const payments = await Payment.find({ user: userId }).populate("courses", "title regularPrice discountedPrice");
    res.json(payments);
  } catch (error) {
    console.error("Error fetching student payments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch all payment histories for the admin
const fetchAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "firstName lastName email")
      .populate("courses", "title regularPrice discountedPrice");
    res.json(payments);
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPayment, fetchStudentPayments, fetchAllPayments };