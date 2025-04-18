const express = require("express");
const paymentRouter = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// POST /api/payments/create - Create a new payment record
paymentRouter.post("/create", authenticate, paymentController.createPayment);

// PUT /api/payments/update-status
paymentRouter.put("/update-status", authenticate, authorize("Admin"), paymentController.updatePaymentStatus);

// GET /api/payments/student - Fetch payment history for a student
paymentRouter.get("/student", authenticate, authorize("Student"), paymentController.fetchStudentPayments);

// GET /api/payments/admin - Fetch all payment histories for the admin
paymentRouter.get("/admin", authenticate, authorize("Admin"), paymentController.fetchAllPayments);

module.exports = paymentRouter;