const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Đăng ký tài khoản mới
router.post('/register', authController.register);

// POST /api/auth/login - Đăng nhập Student/Instructor
router.post('/login', authController.login);

// POST /api/auth/refresh-token - Lấy token mới với roles cập nhật
router.post('/refresh-token', authenticateToken, authController.refreshToken);

// POST /api/auth/forgot-password - Gửi email đặt lại mật khẩu
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password - Đặt lại mật khẩu bằng token
router.post('/reset-password', authController.resetPassword);

module.exports = router;
