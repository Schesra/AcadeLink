const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');

/**
 * Guest Routes (Public - No authentication required)
 */

// GET /api/courses - Lấy danh sách khóa học
router.get('/courses', guestController.getAllCourses);

// GET /api/courses/:id - Lấy chi tiết khóa học
router.get('/courses/:id', guestController.getCourseDetail);

// GET /api/categories - Lấy danh sách danh mục
router.get('/categories', guestController.getAllCategories);

module.exports = router;
