const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  otherName: String,
  headline: String,
  bio: String,
  email: { type: String, unique: true },
  phoneNumber: String,
  language: String,
  socialLinks: {
    website: String,
    facebook: String,
    linkedin: String,
    instagram: String,
    youtube: String,
  },
  profileImage: String,
  password: String,
  country: String,
  role: { type: String, enum: ["Admin", "Student", "Instructor"], default: "Student" },
  disabled: { type: Boolean, default: false },
});

module.exports = mongoose.model("Profile", profileSchema);
