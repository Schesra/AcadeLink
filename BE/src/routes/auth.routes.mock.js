const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.mock');

/**
 * MOCK Authentication Routes (không cần MySQL)
 * Base path: /api/auth
 */

// POST /api/auth/register - Đăng ký tài khoản mới
router.post('/register', authController.register);

// POST /api/auth/login - Đăng nhập Student/Instructor
router.post('/login', authController.login);

// GET /api/auth/mock/users - Xem danh sách users (debug)
router.get('/mock/users', authController.getMockUsers);

module.exports = router;
