const express = require("express");
const { signup, login, forgotPassword, resetPassword, getAllUsers } = require("../Controller/authcontroller");

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Auth API is working! 🚀");
});

router.get("/users", getAllUsers)

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
