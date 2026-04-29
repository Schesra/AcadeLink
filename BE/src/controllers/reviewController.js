const db = require('../config/database');
const { createNotification } = require('./notificationController');

/**
 * Lấy danh sách review của khóa học
 * GET /api/courses/:id/reviews
 */
const getCourseReviews = async (req, res) => {
  try {
    const { id: course_id } = req.params;

    const [reviews] = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.full_name, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ?
      ORDER BY r.created_at DESC
    `, [course_id]);

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        ROUND(AVG(rating), 1) as avg_rating,
        SUM(rating = 5) as five_star,
        SUM(rating = 4) as four_star,
        SUM(rating = 3) as three_star,
        SUM(rating = 2) as two_star,
        SUM(rating = 1) as one_star
      FROM reviews WHERE course_id = ?
    `, [course_id]);

    res.json({ message: 'Lấy đánh giá thành công', stats: stats[0], reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Tạo review mới
 * POST /api/courses/:id/reviews
 */
const createReview = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const user_id = req.user.user_id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating', message: 'Rating phải từ 1 đến 5' });
    }

    // Kiểm tra đã enroll và approved chưa
    const [enrollments] = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = ?',
      [user_id, course_id, 'approved']
    );
    if (enrollments.length === 0) {
      return res.status(403).json({ error: 'Forbidden', message: 'Bạn cần hoàn thành khóa học trước khi đánh giá' });
    }

    // Upsert review
    await db.query(`
      INSERT INTO reviews (user_id, course_id, rating, comment, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = CURRENT_TIMESTAMP
    `, [user_id, course_id, rating, comment || null]);

    // Notify instructor
    const [[courseInfo]] = await db.query(
      'SELECT c.title, c.instructor_id, u.full_name, u.username FROM courses c JOIN users u ON u.id = ? WHERE c.id = ?',
      [user_id, course_id]
    );
    if (courseInfo) {
      const reviewerName = courseInfo.full_name || courseInfo.username;
      const stars = '⭐'.repeat(rating);
      await createNotification(
        courseInfo.instructor_id,
        'new_review',
        'Có đánh giá mới trên khóa học của bạn',
        `${reviewerName} vừa đánh giá ${stars} (${rating}/5) cho khóa học "${courseInfo.title}".${comment ? ` Nhận xét: "${comment}"` : ''}`,
        Number(course_id)
      );
    }

    res.status(201).json({ message: 'Đánh giá thành công' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Xóa review của mình
 * DELETE /api/courses/:id/reviews
 */
const deleteReview = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const user_id = req.user.user_id;

    const [result] = await db.query(
      'DELETE FROM reviews WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy đánh giá' });
    }

    res.json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCourseReviews, createReview, deleteReview };
