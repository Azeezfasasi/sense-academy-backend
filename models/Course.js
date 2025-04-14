const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: String,
  duration: String,
  videoLink: String,
});

const chapterSchema = new mongoose.Schema({
  title: String,
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
  title: String,
  subTitle: String,
  description: String,
  category: String,
  duration: String,
  video: String,
  regularPrice: Number,
  discountedPrice: Number,
  level: String,
  rating: { type: Number, default: 0 },
  language: String,
  introVideo: String,
  introImage: String,
  material: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  chapters: [chapterSchema],
  status: { type: String, enum: ["Pending", "Approved", "Published", "Rejected"], default: "Pending" },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
