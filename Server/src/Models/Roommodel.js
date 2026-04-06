const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  roomLink: { type: String },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // auto-delete after 24h
});

module.exports = mongoose.model("Room", roomSchema);