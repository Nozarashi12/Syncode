const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/Config/db");
const authRoutes = require("./src/Routes/authRoutes");
const compilerRoutes = require("./src/Routes/compileroute");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "*",//Allow frontend origin
        credentials: true, // Allow cookies & authentication headers
    })
);

// ✅ Correct API route paths
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/compiler", compilerRoutes); // Compiler routes
// app.use("/api/auth", compilercontroller);

const PORT = process.env.PORT || 3020;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
