const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('Register route hit');
    console.log('Request body:', req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log('Missing fields');
      return res.status(400).json({ message: 'All fields are required.' });
    }

    console.log('Checking existing user...');
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'Email already exists.' });
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Creating user...');
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    console.log('User created:', user._id);

    return res.status(201).json({
      message: 'User registered successfully.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN HIT ===');
    console.log('Login body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    console.log('Found user:', user);

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password incorrect');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login success');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;