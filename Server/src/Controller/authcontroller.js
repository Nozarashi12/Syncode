const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/Usermodel");
const nodemailer = require("nodemailer");

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Exclude passwords for security
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};


// Setup Nodemailer Transporter (Use your real email credentials)
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "adithyanadhi619@gmail.com",
        pass: "hpac bxzz rlht czva",
    },
});


// 🔹 Signup Route
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        let existingUsername = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User email already exists" });
        }
        if (existingUsername) {
            return res.status(400).json({ message: "User name already exists" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error signing up", error: error.message });
    }
};

// 🔹 Login Route
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.Jwtkey, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// 🔹 Forgot Password (Sends Reset Email with JWT)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate JWT reset token (valid for 15 minutes)
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.Jwtkey,
            { expiresIn: "5m" }
        );

        // Send email with reset link
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link is valid for 15 minutes.</p>`,
        });

        res.status(200).json({ message: "Password reset email sent" });

    } catch (error) {
        res.status(500).json({ message: "Error sending reset email", error: error.message });
    }
};

// 🔹 Reset Password (Verifies JWT and Updates Password)
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.Jwtkey);

        // Find user by decoded ID
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: "Invalid token or user does not exist" });
        }

        // Hash new password and save
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password reset successful. You can now log in." });

    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token", error: error.message });
    }
};
