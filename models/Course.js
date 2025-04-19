const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  videoLink: { type: String, required: false },
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  completedLessons: [{ type: String }], // Store lesson IDs as strings
  progressPercentage: { type: Number, default: 0 }, // Store progress percentage
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  video: { type: String },
  regularPrice: { type: Number, required: true },
  discountedPrice: { type: Number },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  language: { type: String },
  introVideo: { type: String },
  introImage: { type: String },
  material: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  chapters: [chapterSchema],
  status: { type: String, enum: ["Pending", "Approved", "Published", "Rejected"], default: "Pending" },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  progress: [progressSchema], // Track progress for each user
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
