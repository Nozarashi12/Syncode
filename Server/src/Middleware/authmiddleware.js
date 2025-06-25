const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const authenticateUser = (req, res, next) => {
    try {
        // Get the token from the request header
        const token = req.header("Authorization");

        // Check if token is missing
        if (!token) {
            return res.status(401).json({ message: "Access Denied. No Token Provided." });
        }

        // Verify the token
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.Jwtkey);
        req.user = decoded; // Add user data to the request object

        next(); // Move to the next middleware
    } catch (error) {
        res.status(401).json({ message: "Invalid Token", error: error.message });
    }
};

module.exports = authenticateUser;
