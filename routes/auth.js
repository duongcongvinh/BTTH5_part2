const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.json({ message: "✅ User registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "❌ Invalid credentials" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: "❌ Invalid credentials" });

  req.session.userId = user._id;
  res.json({ message: "✅ Logged in" });
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "✅ Logged out" });
  });
});

// Profile (/me)
router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
  const user = await User.findById(req.session.userId).select("-password");
  res.json({ message: "✅ Logged in", user });
});

module.exports = router;
