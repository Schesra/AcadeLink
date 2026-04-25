const db = require('../config/database');

/**
 * Đăng ký khóa học
 * POST /api/enrollments
 */
const enrollCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.user_id;

    // Validation
    if (!course_id) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'course_id là bắt buộc' 
      });
    }

    // Kiểm tra khóa học có tồn tại không
    const [courses] = await db.query(
      'SELECT id, title FROM courses WHERE id = ?',
      [course_id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy khóa học' 
      });
    }

    // Kiểm tra đã đăng ký chưa
    const [existingEnrollments] = await db.query(
      'SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (existingEnrollments.length > 0) {
      const status = existingEnrollments[0].status;
      let message = 'Bạn đã đăng ký khóa học này rồi';
      
      if (status === 'pending') {
        message = 'Yêu cầu đăng ký của bạn đang chờ duyệt';
      } else if (status === 'approved') {
        message = 'Bạn đã được duyệt vào khóa học này';
      } else if (status === 'rejected') {
        message = 'Yêu cầu đăng ký của bạn đã bị từ chối';
      }

      return res.status(409).json({ 
        error: 'Already enrolled',
        message 
      });
    }

    // Tạo enrollment mới với status = pending
    const [result] = await db.query(
      'INSERT INTO enrollments (user_id, course_id, status, enrolled_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [user_id, course_id, 'pending']
    );

    res.status(201).json({
      message: 'Đăng ký khóa học thành công. Vui lòng chờ giảng viên duyệt.',
      enrollment: {
        id: result.insertId,
        user_id,
        course_id,
        status: 'pending',
        course_title: courses[0].title
      }
    });

  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi đăng ký khóa học' 
    });
  }
};

/**
 * Lấy danh sách khóa học đã đăng ký
 * GET /api/my-courses
 */
const getMyCourses = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [enrollments] = await db.query(`
      SELECT 
        e.id as enrollment_id,
        e.status,
        e.enrolled_at,
        c.id as course_id,
        c.title,
        c.description,
        c.thumbnail_url,
        cat.category_name,
        u.username as instructor_name,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `, [user_id]);

    res.json({
      message: 'Lấy danh sách khóa học đã đăng ký thành công',
      total: enrollments.length,
      enrollments
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi lấy danh sách khóa học' 
    });
  }
};

/**
 * Xem bài học của khóa học (chỉ nếu đã được approve)
 * GET /api/courses/:id/lessons
 */
const getCourseLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Kiểm tra enrollment
    const [enrollments] = await db.query(
      'SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, id]
    );

    if (enrollments.length === 0) {
      return res.status(403).json({ 
        error: 'Not enrolled',
        message: 'Bạn chưa đăng ký khóa học này' 
      });
    }

    if (enrollments[0].status !== 'approved') {
      return res.status(403).json({ 
        error: 'Not approved',
        message: 'Bạn chưa được duyệt vào khóa học này' 
      });
    }

    // Lấy danh sách bài học
    const [lessons] = await db.query(`
      SELECT
        id,
        title,
        content,
        video_url,
        lesson_type,
        \`order\`,
        created_at
      FROM lessons
      WHERE course_id = ?
      ORDER BY \`order\` ASC
    `, [id]);

    // Gắn câu hỏi cho các bài quiz
    const quizLessonIds = lessons.filter(l => l.lesson_type === 'quiz').map(l => l.id);
    let questionsByLesson = {};
    if (quizLessonIds.length > 0) {
      const [questions] = await db.query(
        'SELECT id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option, `order` FROM quiz_questions WHERE lesson_id IN (?) ORDER BY `order` ASC',
        [quizLessonIds]
      );
      for (const q of questions) {
        if (!questionsByLesson[q.lesson_id]) questionsByLesson[q.lesson_id] = [];
        questionsByLesson[q.lesson_id].push(q);
      }
    }

    const lessonsWithQuestions = lessons.map(l => ({
      ...l,
      questions: l.lesson_type === 'quiz' ? (questionsByLesson[l.id] || []) : undefined
    }));

    res.json({
      message: 'Lấy danh sách bài học thành công',
      total: lessonsWithQuestions.length,
      lessons: lessonsWithQuestions
    });

  } catch (error) {
    console.error('Get course lessons error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi lấy danh sách bài học' 
    });
  }
};

module.exports = {
  enrollCourse,
  getMyCourses,
  getCourseLessons
};
