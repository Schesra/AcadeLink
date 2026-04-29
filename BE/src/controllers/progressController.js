const db = require('../config/database');
const { createNotification } = require('./notificationController');

/**
 * Lấy tiến độ học của user trong một khóa học
 * GET /api/courses/:id/progress
 */
const getCourseProgress = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const user_id = req.user.user_id;

    const [progress] = await db.query(`
      SELECT lp.lesson_id, lp.completed_at
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.user_id = ? AND l.course_id = ?
    `, [user_id, course_id]);

    const completedIds = progress.map(p => p.lesson_id);
    res.json({ message: 'Lấy tiến độ thành công', completed_lesson_ids: completedIds });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Đánh dấu bài học hoàn thành
 * POST /api/lessons/:id/complete
 */
const completeLesson = async (req, res) => {
  try {
    const { id: lesson_id } = req.params;
    const user_id = req.user.user_id;

    // Kiểm tra lesson tồn tại và user đã enroll
    const [lessons] = await db.query(
      'SELECT l.id, l.course_id FROM lessons l WHERE l.id = ?',
      [lesson_id]
    );
    if (lessons.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy bài học' });
    }

    const { course_id } = lessons[0];
    const [enrollments] = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = ?',
      [user_id, course_id, 'approved']
    );
    if (enrollments.length === 0) {
      return res.status(403).json({ error: 'Forbidden', message: 'Bạn chưa được duyệt vào khóa học này' });
    }

    await db.query(`
      INSERT IGNORE INTO lesson_progress (user_id, lesson_id, completed_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [user_id, lesson_id]);

    // Tính tiến độ để gửi thông báo
    const [[totalRow]] = await db.query(
      'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?', [course_id]
    );
    const [[doneRow]] = await db.query(
      'SELECT COUNT(*) as done FROM lesson_progress lp JOIN lessons l ON lp.lesson_id = l.id WHERE lp.user_id = ? AND l.course_id = ?',
      [user_id, course_id]
    );
    const total = totalRow.total;
    const done = doneRow.done;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const [[courseInfo]] = await db.query('SELECT title FROM courses WHERE id = ?', [course_id]);
    const courseTitle = courseInfo?.title || 'Khóa học';

    if (pct === 100) {
      // Kiểm tra chưa gửi thông báo hoàn thành
      const [existing] = await db.query(
        'SELECT id FROM notifications WHERE user_id = ? AND type = ? AND related_id = ?',
        [user_id, 'course_completed', course_id]
      );
      if (existing.length === 0) {
        await createNotification(
          user_id, 'course_completed',
          'Chúc mừng hoàn thành khóa học! 🎉',
          `Bạn đã hoàn thành toàn bộ ${total} bài học của khóa học "${courseTitle}". Hãy để lại đánh giá để giúp đỡ người học khác nhé!`,
          course_id
        );
      }
    } else if (pct >= 50 && pct < 80 && done > 0) {
      // Gửi nhắc đánh giá một lần khi đạt ngưỡng 50%
      const prevPct = total > 0 ? Math.round(((done - 1) / total) * 100) : 0;
      if (prevPct < 50) {
        await createNotification(
          user_id, 'review_reminder',
          'Bạn đang học rất tốt! ⭐',
          `Bạn đã hoàn thành ${pct}% khóa học "${courseTitle}". Hãy để lại đánh giá của bạn để giúp cộng đồng học tốt hơn nhé!`,
          course_id
        );
      }
    }

    res.json({ message: 'Đánh dấu hoàn thành thành công', lesson_id: Number(lesson_id) });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Bỏ đánh dấu hoàn thành bài học
 * DELETE /api/lessons/:id/complete
 */
const uncompleteLesson = async (req, res) => {
  try {
    const { id: lesson_id } = req.params;
    const user_id = req.user.user_id;

    await db.query(
      'DELETE FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [user_id, lesson_id]
    );

    res.json({ message: 'Bỏ đánh dấu hoàn thành thành công' });
  } catch (error) {
    console.error('Uncomplete lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCourseProgress, completeLesson, uncompleteLesson };
