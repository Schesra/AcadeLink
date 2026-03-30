const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const studentController = require('../controllers/studentController');

/**
 * Student Routes
 * Require authentication and student role
 */

// POST /api/enrollments - Đăng ký khóa học
router.post('/enrollments', 
  authenticateToken, 
  checkRole(['student', 'instructor', 'admin']), 
  studentController.enrollCourse
);

// GET /api/my-courses - Lấy khóa học đã đăng ký
router.get('/my-courses', 
  authenticateToken, 
  checkRole(['student', 'instructor', 'admin']), 
  studentController.getMyCourses
);

// GET /api/courses/:id/lessons - Xem bài học (nếu đã enroll)
router.get('/courses/:id/lessons', 
  authenticateToken, 
  checkRole(['student', 'instructor', 'admin']), 
  studentController.getCourseLessons
);

module.exports = router;
