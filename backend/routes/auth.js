const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM Users WHERE Username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    req.session.user = { id: user.UserID, username: user.Username };
    return res.json({ message: 'Login successful.', username: user.Username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  // Strong password: uppercase, lowercase, digit, special char
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]{8,}$/;
  if (!strongPassword.test(password)) {
    return res.status(400).json({
      message: 'Password must contain uppercase, lowercase, a number, and a special character (@$!%*?&_#).',
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const [existing] = await db.query('SELECT UserID FROM Users WHERE Username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username already taken. Choose another.' });
    }
    const hashed = await bcrypt.hash(password, 12);
    await db.query('INSERT INTO Users (Username, Password) VALUES (?, ?)', [username.trim(), hashed]);
    return res.status(201).json({ message: 'Account created successfully. You can now sign in.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully.' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, username: req.session.user.username });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;
