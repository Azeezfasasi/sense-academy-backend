const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  otherName: String,
  courseTitle: String,
  certificateDescription: String,
  issueDate: { type: Date, default: Date.now },
  certificateSignature: String,
  verifyLink: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
