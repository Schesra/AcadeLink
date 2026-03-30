const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

/**
 * Test Routes - Không cần database
 * Base path: /api/test
 */

// Test 1: Basic endpoint
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Test 2: Bcrypt hashing
router.post('/hash', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    res.json({
      original: password,
      hash: hash,
      saltRounds: saltRounds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 3: Bcrypt compare
router.post('/verify', async (req, res) => {
  try {
    const { password, hash } = req.body;
    
    if (!password || !hash) {
      return res.status(400).json({ error: 'Password and hash are required' });
    }

    const isMatch = await bcrypt.compare(password, hash);
    
    res.json({
      password: password,
      hash: hash,
      isMatch: isMatch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 4: Generate JWT token
router.post('/generate-token', (req, res) => {
  try {
    const { user_id, email, roles } = req.body;
    
    if (!user_id || !email) {
      return res.status(400).json({ error: 'user_id and email are required' });
    }

    const token = jwt.sign(
      {
        user_id: user_id,
        email: email,
        roles: roles || ['student']
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      token: token,
      payload: {
        user_id,
        email,
        roles: roles || ['student']
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 5: Verify JWT token (protected route)
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'You have access to this protected route!',
    user: req.user
  });
});

// Test 6: Admin only route
router.get('/admin-only', authenticateToken, checkRole(['admin']), (req, res) => {
  res.json({
    message: 'Welcome Admin!',
    user: req.user
  });
});

// Test 7: Instructor or Admin route
router.get('/instructor-or-admin', authenticateToken, checkRole(['instructor', 'admin']), (req, res) => {
  res.json({
    message: 'Welcome Instructor or Admin!',
    user: req.user
  });
});

module.exports = router;
