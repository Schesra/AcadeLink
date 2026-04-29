const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { getCourseProgress, completeLesson, uncompleteLesson } = require('../controllers/progressController');

const auth = [authenticateToken, checkRole(['student', 'instructor', 'admin'])];

// GET /api/courses/:id/progress
router.get('/courses/:id/progress', ...auth, getCourseProgress);

// POST /api/lessons/:id/complete
router.post('/lessons/:id/complete', ...auth, completeLesson);

// DELETE /api/lessons/:id/complete
router.delete('/lessons/:id/complete', ...auth, uncompleteLesson);

module.exports = router;
