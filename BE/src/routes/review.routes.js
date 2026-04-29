const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { getCourseReviews, createReview, deleteReview } = require('../controllers/reviewController');

// GET /api/courses/:id/reviews - Public
router.get('/courses/:id/reviews', getCourseReviews);

// POST /api/courses/:id/reviews - Auth required
router.post('/courses/:id/reviews', authenticateToken, checkRole(['student', 'instructor', 'admin']), createReview);

// DELETE /api/courses/:id/reviews - Auth required
router.delete('/courses/:id/reviews', authenticateToken, checkRole(['student', 'instructor', 'admin']), deleteReview);

module.exports = router;
