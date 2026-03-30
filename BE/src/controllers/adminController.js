const db = require('../config/database.sqlite');

// ==================== CATEGORIES ====================

/**
 * Lấy tất cả danh mục
 * GET /api/admin/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT 
        cat.id,
        cat.category_name,
        cat.description,
        cat.created_at,
        cat.updated_at,
        (SELECT COUNT(*) FROM courses WHERE category_id = cat.id) as course_count
      FROM categories cat
      ORDER BY cat.category_name ASC
    `);

    res.json({
      message: 'Lấy danh sách danh mục thành công',
      total: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Tạo danh mục mới
 * POST /api/admin/categories
 */
const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Tên danh mục là bắt buộc' 
      });
    }

    // Kiểm tra trùng tên
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE category_name = ?',
      [category_name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Category already exists',
        message: 'Tên danh mục đã tồn tại' 
      });
    }

    const [result] = await db.query("INSERT INTO categories (category_name, description, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [category_name, description || null]
    );

    res.status(201).json({
      message: 'Tạo danh mục thành công',
      category: {
        id: result.insertId,
        category_name,
        description: description || null
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Cập nhật danh mục
 * PUT /api/admin/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Tên danh mục là bắt buộc' 
      });
    }

    // Kiểm tra tồn tại
    const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.query("UPDATE categories SET category_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [category_name, description || null, id]
    );

    res.json({
      message: 'Cập nhật danh mục thành công',
      category: { id, category_name, description }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Xóa danh mục
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra có khóa học nào dùng danh mục này không
    const [courses] = await db.query(
      'SELECT id FROM courses WHERE category_id = ?',
      [id]
    );

    if (courses.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete',
        message: 'Không thể xóa danh mục đang có khóa học' 
      });
    }

    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== COURSES ====================

/**
 * Lấy tất cả khóa học
 * GET /api/admin/courses
 */
const getAllCourses = async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.thumbnail_url,
        c.created_at,
        c.updated_at,
        cat.category_name,
        u.username as instructor_name,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.instructor_id = u.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      message: 'Lấy danh sách khóa học thành công',
      total: courses.length,
      courses
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Tạo khóa học mới
 * POST /api/admin/courses
 */
const createCourse = async (req, res) => {
  try {
    const { instructor_id, category_id, title, description, price, thumbnail_url } = req.body;

    if (!instructor_id || !category_id || !title || price === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'instructor_id, category_id, title, price là bắt buộc' 
      });
    }

    if (price < 0) {
      return res.status(400).json({ 
        error: 'Invalid price',
        message: 'Giá phải >= 0' 
      });
    }

    const [result] = await db.query("INSERT INTO courses (instructor_id, category_id, title, description, price, thumbnail_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [instructor_id, category_id, title, description || null, price, thumbnail_url || null]
    );

    res.status(201).json({
      message: 'Tạo khóa học thành công',
      course: {
        id: result.insertId,
        instructor_id,
        category_id,
        title,
        description,
        price,
        thumbnail_url
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Cập nhật khóa học
 * PUT /api/admin/courses/:id
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, title, description, price, thumbnail_url } = req.body;

    if (!category_id || !title || price === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'category_id, title, price là bắt buộc' 
      });
    }

    if (price < 0) {
      return res.status(400).json({ 
        error: 'Invalid price',
        message: 'Giá phải >= 0' 
      });
    }

    const [result] = await db.query("UPDATE courses SET category_id = ?, title = ?, description = ?, price = ?, thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [category_id, title, description || null, price, thumbnail_url || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Cập nhật khóa học thành công' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Xóa khóa học
 * DELETE /api/admin/courses/:id
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Xóa khóa học thành công' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== LESSONS ====================

/**
 * Lấy tất cả bài học
 * GET /api/admin/lessons
 */
const getAllLessons = async (req, res) => {
  try {
    const [lessons] = await db.query(`
      SELECT 
        l.id,
        l.title,
        l.content,
        l.video_url,
        l.\`order\`,
        l.created_at,
        c.title as course_title,
        c.id as course_id
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      ORDER BY c.id, l.\`order\` ASC
    `);

    res.json({
      message: 'Lấy danh sách bài học thành công',
      total: lessons.length,
      lessons
    });
  } catch (error) {
    console.error('Get all lessons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Tạo bài học mới
 * POST /api/admin/lessons
 */
const createLesson = async (req, res) => {
  try {
    const { course_id, title, content, video_url, order } = req.body;

    if (!course_id || !title || !order) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'course_id, title, order là bắt buộc' 
      });
    }

    if (order < 1) {
      return res.status(400).json({ 
        error: 'Invalid order',
        message: 'Thứ tự phải >= 1' 
      });
    }

    const [result] = await db.query("INSERT INTO lessons (course_id, title, content, video_url, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [course_id, title, content || null, video_url || null, order]
    );

    res.status(201).json({
      message: 'Tạo bài học thành công',
      lesson: {
        id: result.insertId,
        course_id,
        title,
        content,
        video_url,
        order
      }
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Cập nhật bài học
 * PUT /api/admin/lessons/:id
 */
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, title, content, video_url, order } = req.body;

    if (!course_id || !title || !order) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'course_id, title, order là bắt buộc' 
      });
    }

    if (order < 1) {
      return res.status(400).json({ 
        error: 'Invalid order',
        message: 'Thứ tự phải >= 1' 
      });
    }

    const [result] = await db.query("UPDATE lessons SET course_id = ?, title = ?, content = ?, video_url = ?, `order` = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [course_id, title, content || null, video_url || null, order, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ message: 'Cập nhật bài học thành công' });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Xóa bài học
 * DELETE /api/admin/lessons/:id
 */
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM lessons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ message: 'Xóa bài học thành công' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== ENROLLMENTS ====================

/**
 * Lấy tất cả enrollment
 * GET /api/admin/enrollments
 */
const getAllEnrollments = async (req, res) => {
  try {
    const [enrollments] = await db.query(`
      SELECT 
        e.id,
        e.status,
        e.enrolled_at,
        e.updated_at,
        u.username,
        u.email,
        c.title as course_title,
        c.id as course_id
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC
    `);

    res.json({
      message: 'Lấy danh sách enrollment thành công',
      total: enrollments.length,
      enrollments
    });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Cập nhật trạng thái enrollment
 * PUT /api/admin/enrollments/:id
 */
const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'Status phải là pending, approved hoặc rejected' 
      });
    }

    const [result] = await db.query("UPDATE enrollments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ message: 'Cập nhật enrollment thành công' });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  // Categories
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Courses
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  // Lessons
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  // Enrollments
  getAllEnrollments,
  updateEnrollment
};
