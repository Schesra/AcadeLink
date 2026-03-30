const db = require('../config/database.sqlite');

/**
 * Đăng ký trở thành instructor
 * POST /api/instructor/become
 */
const becomeInstructor = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Kiểm tra đã có role instructor chưa
    const [existingRoles] = await db.query(
      'SELECT id FROM user_roles WHERE user_id = ? AND role = ?',
      [user_id, 'instructor']
    );

    if (existingRoles.length > 0) {
      return res.status(409).json({ 
        error: 'Already instructor',
        message: 'Bạn đã là instructor rồi' 
      });
    }

    // Thêm role instructor
    await db.query(
      "INSERT INTO user_roles (user_id, role, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
      [user_id, 'instructor']
    );

    res.status(201).json({
      message: 'Đăng ký trở thành instructor thành công',
      user_id,
      role: 'instructor'
    });

  } catch (error) {
    console.error('Become instructor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== MY COURSES ====================

/**
 * Lấy khóa học của tôi
 * GET /api/instructor/courses
 */
const getMyCourses = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;

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
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as student_count
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.instructor_id = ?
      ORDER BY c.created_at DESC
    `, [instructor_id]);

    res.json({
      message: 'Lấy danh sách khóa học của tôi thành công',
      total: courses.length,
      courses
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Tạo khóa học mới
 * POST /api/instructor/courses
 */
const createCourse = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
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

    const [result] = await db.query(
      "INSERT INTO courses (instructor_id, category_id, title, description, price, thumbnail_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
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
 * Cập nhật khóa học của tôi
 * PUT /api/instructor/courses/:id
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.user_id;
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

    // Chỉ update khóa học của mình
    const [result] = await db.query("UPDATE courses SET category_id = ?, title = ?, description = ?, price = ?, thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND instructor_id = ?",
      [category_id, title, description || null, price, thumbnail_url || null, id, instructor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy khóa học hoặc bạn không có quyền sửa' 
      });
    }

    res.json({ message: 'Cập nhật khóa học thành công' });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Xóa khóa học của tôi
 * DELETE /api/instructor/courses/:id
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.user_id;

    const [result] = await db.query(
      'DELETE FROM courses WHERE id = ? AND instructor_id = ?',
      [id, instructor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy khóa học hoặc bạn không có quyền xóa' 
      });
    }

    res.json({ message: 'Xóa khóa học thành công' });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== MY LESSONS ====================

/**
 * Lấy bài học của tôi
 * GET /api/instructor/lessons
 */
const getMyLessons = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;

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
      WHERE c.instructor_id = ?
      ORDER BY c.id, l.\`order\` ASC
    `, [instructor_id]);

    res.json({
      message: 'Lấy danh sách bài học của tôi thành công',
      total: lessons.length,
      lessons
    });

  } catch (error) {
    console.error('Get my lessons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Tạo bài học mới
 * POST /api/instructor/lessons
 */
const createLesson = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
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

    // Kiểm tra course có phải của mình không
    const [courses] = await db.query(
      'SELECT id FROM courses WHERE id = ? AND instructor_id = ?',
      [course_id, instructor_id]
    );

    if (courses.length === 0) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Bạn không có quyền thêm bài học vào khóa học này' 
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
 * Cập nhật bài học của tôi
 * PUT /api/instructor/lessons/:id
 */
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.user_id;
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

    // Chỉ update bài học của khóa học mình tạo
    const [result] = await db.query("UPDATE lessons SET course_id = ?, title = ?, content = ?, video_url = ?, `order` = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?)",
      [course_id, title, content || null, video_url || null, order, id, instructor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy bài học hoặc bạn không có quyền sửa' 
      });
    }

    res.json({ message: 'Cập nhật bài học thành công' });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Xóa bài học của tôi
 * DELETE /api/instructor/lessons/:id
 */
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.user_id;

    const [result] = await db.query(
      'DELETE FROM lessons WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?)',
      [id, instructor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy bài học hoặc bạn không có quyền xóa' 
      });
    }

    res.json({ message: 'Xóa bài học thành công' });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== MY ENROLLMENTS ====================

/**
 * Lấy enrollment của khóa học tôi tạo
 * GET /api/instructor/enrollments
 */
const getMyEnrollments = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
    const { status } = req.query;

    let query = `
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
      WHERE c.instructor_id = ?
    `;

    const params = [instructor_id];

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += ' ORDER BY e.enrolled_at DESC';

    const [enrollments] = await db.query(query, params);

    res.json({
      message: 'Lấy danh sách enrollment thành công',
      total: enrollments.length,
      enrollments
    });

  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Duyệt enrollment
 * PUT /api/instructor/enrollments/:id/approve
 */
const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.user_id;

    // Chỉ approve enrollment của khóa học mình tạo
    const [result] = await db.query("UPDATE enrollments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?) AND status = ?",
      ['approved', id, instructor_id, 'pending']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy enrollment hoặc đã được xử lý' 
      });
    }

    res.json({ message: 'Duyệt enrollment thành công' });

  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Từ chối enrollment
 * PUT /api/instructor/enrollments/:id/reject
 */
const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.user_id;

    const [result] = await db.query("UPDATE enrollments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?) AND status = ?",
      ['rejected', id, instructor_id, 'pending']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy enrollment hoặc đã được xử lý' 
      });
    }

    res.json({ message: 'Từ chối enrollment thành công' });

  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  becomeInstructor,
  // My Courses
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  // My Lessons
  getMyLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  // My Enrollments
  getMyEnrollments,
  approveEnrollment,
  rejectEnrollment
};
