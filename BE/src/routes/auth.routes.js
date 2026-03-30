const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Đăng ký tài khoản mới
router.post('/register', authController.register);

// POST /api/auth/login - Đăng nhập Student/Instructor
router.post('/login', authController.login);

module.exports = router;
