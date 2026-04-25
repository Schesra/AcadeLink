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
router.get('/courses/:id', authenticateToken, checkRole(['admin']), adminController.getCourseDetail);
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

// ==================== INSTRUCTORS ====================
router.get('/instructors', authenticateToken, checkRole(['admin']), adminController.getAllInstructors);
router.get('/instructors/:id/courses', authenticateToken, checkRole(['admin']), adminController.getInstructorCourses);
router.delete('/instructors/:id/role', authenticateToken, checkRole(['admin']), adminController.removeInstructorRole);

// ==================== USERS ====================
router.get('/users', authenticateToken, checkRole(['admin']), adminController.getAllUsers);
router.delete('/users/:id', authenticateToken, checkRole(['admin']), adminController.deleteUser);

module.exports = router;
