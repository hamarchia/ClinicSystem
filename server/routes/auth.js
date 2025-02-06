const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login Route
router.post('/login', async (req, res) => {
  try {
    console.log("Hit: Login API");
    const { username, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // 3. Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      role: user.role,
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err);
  }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    //console.log(username)
    // 1. Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role
    });

  } catch (err) {
    res.status(500).json({ message: err });
  }
});

module.exports = router;