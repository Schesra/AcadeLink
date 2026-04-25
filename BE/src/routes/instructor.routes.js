const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const instructorController = require('../controllers/instructorController');

/**
 * Instructor Routes
 * Base path: /api/instructor
 */

// POST /api/instructor/become - Đăng ký trở thành instructor
router.post('/become', 
  authenticateToken, 
  checkRole(['student']), 
  instructorController.becomeInstructor
);

// ==================== MY COURSES ====================
router.get('/courses', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.getMyCourses
);

router.post('/courses', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.createCourse
);

router.put('/courses/:id', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.updateCourse
);

router.delete('/courses/:id', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.deleteCourse
);

// ==================== MY LESSONS ====================
router.get('/lessons', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.getMyLessons
);

router.post('/lessons', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.createLesson
);

router.put('/lessons/:id', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.updateLesson
);

router.delete('/lessons/:id', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.deleteLesson
);

// ==================== QUIZ QUESTIONS ====================
router.get('/lessons/:lessonId/questions',
  authenticateToken,
  checkRole(['instructor', 'admin']),
  instructorController.getQuizQuestions
);

router.post('/lessons/:lessonId/questions',
  authenticateToken,
  checkRole(['instructor', 'admin']),
  instructorController.createQuizQuestion
);

router.put('/questions/:questionId',
  authenticateToken,
  checkRole(['instructor', 'admin']),
  instructorController.updateQuizQuestion
);

router.delete('/questions/:questionId',
  authenticateToken,
  checkRole(['instructor', 'admin']),
  instructorController.deleteQuizQuestion
);

// ==================== MY ENROLLMENTS ====================
router.get('/enrollments', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.getMyEnrollments
);

router.put('/enrollments/:id/approve', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.approveEnrollment
);

router.put('/enrollments/:id/reject', 
  authenticateToken, 
  checkRole(['instructor', 'admin']), 
  instructorController.rejectEnrollment
);

module.exports = router;
