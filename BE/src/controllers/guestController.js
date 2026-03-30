const db = require('../config/database.sqlite');

/**
 * Lấy danh sách tất cả khóa học (Public)
 * GET /api/courses
 */
const getAllCourses = async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.thumbnail_url,
        c.created_at,
        cat.category_name,
        u.username as instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as student_count
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.instructor_id = u.id
    `;

    const params = [];

    if (category_id) {
      query += ' WHERE c.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY c.created_at DESC';

    const [courses] = await db.query(query, params);

    res.json({
      message: 'Lấy danh sách khóa học thành công',
      total: courses.length,
      courses
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi lấy danh sách khóa học' 
    });
  }
};

/**
 * Lấy chi tiết khóa học (Public)
 * GET /api/courses/:id
 */
const getCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin khóa học
    const [courses] = await db.query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.thumbnail_url,
        c.created_at,
        c.instructor_id,
        cat.id as category_id,
        cat.category_name,
        u.username as instructor_name,
        u.full_name as instructor_full_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as student_count
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (courses.length === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy khóa học' 
      });
    }

    // Lấy danh sách bài học (curriculum)
    const [lessons] = await db.query(`
      SELECT id, title, \`order\`
      FROM lessons
      WHERE course_id = ?
      ORDER BY \`order\` ASC
    `, [id]);

    const course = courses[0];
    course.lessons = lessons;
    course.lesson_count = lessons.length;

    res.json({
      message: 'Lấy chi tiết khóa học thành công',
      course
    });

  } catch (error) {
    console.error('Get course detail error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi lấy chi tiết khóa học' 
    });
  }
};

/**
 * Lấy danh sách danh mục (Public)
 * GET /api/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT 
        cat.id,
        cat.category_name,
        cat.description,
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
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi lấy danh sách danh mục' 
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseDetail,
  getAllCategories
};
