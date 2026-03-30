const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const adminController = require('../controllers/adminController');

/**
 * Admin Routes
 * Base path: /api/admin
 */

// POST /api/admin/login - Đăng nhập Admin
router.post('/login', authController.adminLogin);

// ==================== CATEGORIES ====================
router.get('/categories', authenticateToken, checkRole(['admin']), adminController.getAllCategories);
router.post('/categories', authenticateToken, checkRole(['admin']), adminController.createCategory);
router.put('/categories/:id', authenticateToken, checkRole(['admin']), adminController.updateCategory);
router.delete('/categories/:id', authenticateToken, checkRole(['admin']), adminController.deleteCategory);

// ==================== COURSES ====================
router.get('/courses', authenticateToken, checkRole(['admin']), adminController.getAllCourses);
router.post('/courses', authenticateToken, checkRole(['admin']), adminController.createCourse);
router.put('/courses/:id', authenticateToken, checkRole(['admin']), adminController.updateCourse);
router.delete('/courses/:id', authenticateToken, checkRole(['admin']), adminController.deleteCourse);

// ==================== LESSONS ====================
router.get('/lessons', authenticateToken, checkRole(['admin']), adminController.getAllLessons);
router.post('/lessons', authenticateToken, checkRole(['admin']), adminController.createLesson);
router.put('/lessons/:id', authenticateToken, checkRole(['admin']), adminController.updateLesson);
router.delete('/lessons/:id', authenticateToken, checkRole(['admin']), adminController.deleteLesson);

// ==================== ENROLLMENTS ====================
router.get('/enrollments', authenticateToken, checkRole(['admin']), adminController.getAllEnrollments);
router.put('/enrollments/:id', authenticateToken, checkRole(['admin']), adminController.updateEnrollment);

module.exports = router;
