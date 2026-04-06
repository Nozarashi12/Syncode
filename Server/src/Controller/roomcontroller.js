const { v4: uuidv4 } = require("uuid");
const Room = require("../Models/Roommodel");

const createRoom = async (req, res) => {
  try {
    const { username } = req.body;
    const roomCode = uuidv4().slice(0, 8).toUpperCase(); // e.g. "A1B2C3D4"
    const roomLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/room/${roomCode}`;

    const room = await Room.create({ roomCode, roomLink, createdBy: username });

    res.status(201).json({ roomCode: room.roomCode, roomLink });
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
};

const validateRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ roomCode: room.roomCode, roomLink: room.roomLink });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createRoom, validateRoom };