const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageID: { type: String, unique: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  subject: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
