const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String,
  type: { type: String, enum: ['Multiple Choice', 'True/False', 'Short Answer'] },
});

const assessmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  title: String,
  description: String,
  questions: [questionSchema],
  totalMarks: Number,
  timeLimit: Number, // in minutes
  attemptsAllowed: Number,
}, { timestamps: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
