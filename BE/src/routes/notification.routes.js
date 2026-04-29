const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

const auth = [authenticateToken, checkRole(['student', 'instructor', 'admin'])];

// GET /api/notifications
router.get('/notifications', ...auth, getNotifications);

// PUT /api/notifications/read-all
router.put('/notifications/read-all', ...auth, markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/notifications/:id/read', ...auth, markAsRead);

module.exports = router;
