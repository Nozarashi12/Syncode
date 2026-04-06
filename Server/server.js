const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/Config/db");
const authRoutes = require("./src/Routes/authRoutes");
const compilerRoutes = require("./src/Routes/compileroute");
const roomRoutes = require("./src/Routes/roomRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/room", roomRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomCode, username }) => {
    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { code: "", language: "python", input: "", output: "", users: [] };
    }

    if (!rooms[roomCode].users.find((u) => u.id === socket.id)) {
      rooms[roomCode].users.push({ id: socket.id, username });
    }

    socket.emit("room-state", {
      code: rooms[roomCode].code,
      language: rooms[roomCode].language,
      input: rooms[roomCode].input,
      output: rooms[roomCode].output,
      users: rooms[roomCode].users,
    });

    socket.to(roomCode).emit("user-joined", {
      username,
      users: rooms[roomCode].users,
    });

    console.log(`${username} joined room ${roomCode}`);
  });

  socket.on("code-change", ({ roomCode, code }) => {
    if (rooms[roomCode]) rooms[roomCode].code = code;
    socket.to(roomCode).emit("code-update", code);
  });

  socket.on("language-change", ({ roomCode, language }) => {
    if (rooms[roomCode]) rooms[roomCode].language = language;
    socket.to(roomCode).emit("language-update", language);
  });

  socket.on("input-change", ({ roomCode, input }) => {
    if (rooms[roomCode]) rooms[roomCode].input = input;
    socket.to(roomCode).emit("input-update", input);
  });

  socket.on("output-change", ({ roomCode, output }) => {
    if (rooms[roomCode]) rooms[roomCode].output = output;
    socket.to(roomCode).emit("output-update", output);
  });

  socket.on("send-message", ({ roomCode, username, message }) => {
    const time = new Date().toLocaleTimeString();
    io.to(roomCode).emit("receive-message", { username, message, time });
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const userIndex = room.users.findIndex((u) => u.id === socket.id);
      if (userIndex !== -1) {
        const [removed] = room.users.splice(userIndex, 1);
        io.to(roomCode).emit("user-left", {
          username: removed.username,
          users: room.users,
        });
        if (room.users.length === 0) delete rooms[roomCode];
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);