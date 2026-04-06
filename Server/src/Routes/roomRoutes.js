const express = require("express");
const { createRoom, validateRoom } = require("../Controller/roomcontroller");
const router = express.Router();

router.post("/create", createRoom);
router.get("/validate/:roomCode", validateRoom);

module.exports = router;