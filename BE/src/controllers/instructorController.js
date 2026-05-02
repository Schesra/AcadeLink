const db = require('../config/database');
const { createNotification } = require('./notificationController');

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
 * FIX: Thay correlated subquery bằng LEFT JOIN aggregate để tránh N*2 subqueries
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
        COALESCE(lc.lesson_count, 0) as lesson_count,
        COALESCE(ec.student_count, 0) as student_count
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as lesson_count
        FROM lessons
        GROUP BY course_id
      ) lc ON lc.course_id = c.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as student_count
        FROM enrollments
        WHERE status = 'approved'
        GROUP BY course_id
      ) ec ON ec.course_id = c.id
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
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi cập nhật khóa học' 
    });
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
        l.lesson_type,
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
    const { course_id, title, content, video_url, lesson_type, order } = req.body;
    const type = lesson_type || 'text';

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

    if (!['text', 'video', 'quiz'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid lesson_type',
        message: 'lesson_type phải là text, video hoặc quiz'
      });
    }

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

    const [result] = await db.query(
      "INSERT INTO lessons (course_id, title, content, video_url, lesson_type, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [course_id, title, content || null, video_url || null, type, order]
    );

    const lessonId = result.insertId;

    // Notify tất cả học viên đã được duyệt vào khóa học
    // FIX: Dùng bulk INSERT thay vì loop N lần để tránh N+1 async calls
    const [[courseInfo]] = await db.query('SELECT title FROM courses WHERE id = ?', [course_id]);
    const [enrolledStudents] = await db.query(
      'SELECT user_id FROM enrollments WHERE course_id = ? AND status = ?',
      [course_id, 'approved']
    );
    if (courseInfo && enrolledStudents.length > 0) {
      const notifValues = enrolledStudents.map(s => [
        s.user_id,
        'new_lesson',
        'Khóa học có bài học mới 📚',
        `Khóa học "${courseInfo.title}" vừa được bổ sung bài học mới: "${title}". Vào học ngay nhé!`,
        Number(course_id)
      ]);
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES ?',
        [notifValues]
      );
    }

    res.status(201).json({
      message: 'Tạo bài học thành công',
      lesson: {
        id: lessonId,
        course_id,
        title,
        content,
        video_url,
        lesson_type: type,
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
    const { course_id, title, content, video_url, lesson_type, order } = req.body;
    const type = lesson_type || 'text';

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

    const [result] = await db.query(
      "UPDATE lessons SET course_id = ?, title = ?, content = ?, video_url = ?, lesson_type = ?, `order` = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?)",
      [course_id, title, content || null, video_url || null, type, order, id, instructor_id]
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

// ==================== QUIZ QUESTIONS ====================

/**
 * Lấy câu hỏi của một bài quiz
 * GET /api/instructor/lessons/:lessonId/questions
 */
const getQuizQuestions = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const instructor_id = req.user.user_id;

    // Verify lesson belongs to instructor's course
    const [lessons] = await db.query(
      'SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE l.id = ? AND c.instructor_id = ?',
      [lessonId, instructor_id]
    );
    if (lessons.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy bài học' });
    }

    const [questions] = await db.query(
      'SELECT id, question, option_a, option_b, option_c, option_d, correct_option, `order` FROM quiz_questions WHERE lesson_id = ? ORDER BY `order` ASC',
      [lessonId]
    );

    res.json({ message: 'OK', total: questions.length, questions });
  } catch (error) {
    console.error('Get quiz questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Tạo câu hỏi quiz
 * POST /api/instructor/lessons/:lessonId/questions
 */
const createQuizQuestion = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const instructor_id = req.user.user_id;
    const { question, option_a, option_b, option_c, option_d, correct_option, order } = req.body;

    if (!question || !option_a || !option_b || !correct_option) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'question, option_a, option_b, correct_option là bắt buộc'
      });
    }

    if (!['a', 'b', 'c', 'd'].includes(correct_option.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid correct_option', message: 'correct_option phải là a, b, c hoặc d' });
    }

    const [lessons] = await db.query(
      'SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE l.id = ? AND c.instructor_id = ? AND l.lesson_type = ?',
      [lessonId, instructor_id, 'quiz']
    );
    if (lessons.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy bài quiz hoặc bạn không có quyền' });
    }

    const questionOrder = order || 1;
    const [result] = await db.query(
      "INSERT INTO quiz_questions (lesson_id, question, option_a, option_b, option_c, option_d, correct_option, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [lessonId, question, option_a, option_b, option_c || null, option_d || null, correct_option.toLowerCase(), questionOrder]
    );

    res.status(201).json({
      message: 'Tạo câu hỏi thành công',
      question: { id: result.insertId, lesson_id: Number(lessonId), question, option_a, option_b, option_c, option_d, correct_option: correct_option.toLowerCase(), order: questionOrder }
    });
  } catch (error) {
    console.error('Create quiz question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Cập nhật câu hỏi quiz
 * PUT /api/instructor/questions/:questionId
 */
const updateQuizQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const instructor_id = req.user.user_id;
    const { question, option_a, option_b, option_c, option_d, correct_option, order } = req.body;

    if (!question || !option_a || !option_b || !correct_option) {
      return res.status(400).json({ error: 'Missing required fields', message: 'question, option_a, option_b, correct_option là bắt buộc' });
    }

    if (!['a', 'b', 'c', 'd'].includes(correct_option.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid correct_option', message: 'correct_option phải là a, b, c hoặc d' });
    }

    const [result] = await db.query(
      "UPDATE quiz_questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, `order` = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND lesson_id IN (SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE c.instructor_id = ?)",
      [question, option_a, option_b, option_c || null, option_d || null, correct_option.toLowerCase(), order || 1, questionId, instructor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy câu hỏi hoặc bạn không có quyền sửa' });
    }

    res.json({ message: 'Cập nhật câu hỏi thành công' });
  } catch (error) {
    console.error('Update quiz question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Xóa câu hỏi quiz
 * DELETE /api/instructor/questions/:questionId
 */
const deleteQuizQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const instructor_id = req.user.user_id;

    const [result] = await db.query(
      "DELETE FROM quiz_questions WHERE id = ? AND lesson_id IN (SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE c.instructor_id = ?)",
      [questionId, instructor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy câu hỏi hoặc bạn không có quyền xóa' });
    }

    res.json({ message: 'Xóa câu hỏi thành công' });
  } catch (error) {
    console.error('Delete quiz question error:', error);
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
    const { status, course_id } = req.query;

    // course_id là bắt buộc
    if (!course_id) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        message: 'course_id là bắt buộc' 
      });
    }

    let query = `
      SELECT 
        e.id,
        e.status,
        e.enrolled_at,
        e.updated_at,
        u.username,
        u.email,
        u.full_name,
        c.title as course_title,
        c.id as course_id
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = ? AND c.id = ?
    `;

    const params = [instructor_id, course_id];

    // Filter by status (optional)
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
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi lấy danh sách enrollment' 
    });
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

    // Chỉ approve enrollment của khóa học mình tạo và status = pending
    const [result] = await db.query(
      'UPDATE enrollments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?) AND status = ?',
      ['approved', id, instructor_id, 'pending']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy enrollment hoặc đã được xử lý' 
      });
    }

    // Gửi thông báo cho student
    const [[enrollment]] = await db.query(
      'SELECT e.user_id, c.title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.id = ?',
      [id]
    );
    if (enrollment) {
      await createNotification(
        enrollment.user_id,
        'enrollment_approved',
        'Yêu cầu đăng ký được duyệt',
        `Yêu cầu đăng ký khóa học "${enrollment.title}" của bạn đã được chấp nhận. Bắt đầu học ngay!`,
        Number(id)
      );
    }

    res.json({ message: 'Duyệt enrollment thành công' });

  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi duyệt enrollment' 
    });
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

    // Chỉ reject enrollment của khóa học mình tạo và status = pending
    const [result] = await db.query(
      'UPDATE enrollments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?) AND status = ?',
      ['rejected', id, instructor_id, 'pending']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Không tìm thấy enrollment hoặc đã được xử lý' 
      });
    }

    // Gửi thông báo cho student
    const [[enrollment]] = await db.query(
      'SELECT e.user_id, c.title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.id = ?',
      [id]
    );
    if (enrollment) {
      await createNotification(
        enrollment.user_id,
        'enrollment_rejected',
        'Yêu cầu đăng ký bị từ chối',
        `Yêu cầu đăng ký khóa học "${enrollment.title}" của bạn đã bị từ chối.`,
        Number(id)
      );
    }

    res.json({ message: 'Từ chối enrollment thành công' });

  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi từ chối enrollment' 
    });
  }
};

/**
 * Lấy thống kê doanh thu của instructor
 * GET /api/instructor/earnings
 */
const getEarnings = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;

    // Số dư từ instructor_transactions (nguồn chính xác)
    const [[balRow]] = await db.query(`
      SELECT
        COALESCE(SUM(
          CASE
            WHEN type = 'credit' THEN amount
            WHEN type = 'debit' THEN -amount
            ELSE 0
          END
        ), 0) AS available_balance,
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS total_credited
      FROM instructor_transactions
      WHERE instructor_id = ?
    `, [instructor_id]);

    const availableBalance = Number(balRow.available_balance);
    const holdingBalance = 0;
    const totalRevenue = Number(balRow.total_credited); // tổng đã nhận (gross, trước debit)

    // Tổng đã rút (completed withdrawals)
    const [[withdrawnRow]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_withdrawn
       FROM withdrawal_requests WHERE instructor_id = ? AND status = 'completed'`,
      [instructor_id]
    );
    const totalWithdrawn = Number(withdrawnRow.total_withdrawn);

    // Doanh thu theo khóa học từ order_items (paid orders)
    const [paidCourseStats] = await db.query(`
      SELECT
        c.id AS course_id,
        c.title,
        c.price,
        COUNT(oi.id) AS sale_count,
        COALESCE(SUM(oi.instructor_amount), 0) AS revenue
      FROM courses c
      LEFT JOIN order_items oi ON oi.course_id = c.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'paid'
      WHERE c.instructor_id = ?
      GROUP BY c.id, c.title, c.price
    `, [instructor_id]);

    // Học viên từ approved enrollments (bao gồm cả free courses)
    const [enrollmentStats] = await db.query(`
      SELECT c.id AS course_id, COUNT(e.id) AS approved_count
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'approved'
      WHERE c.instructor_id = ?
      GROUP BY c.id
    `, [instructor_id]);
    const enrollmentMap = {};
    for (const row of enrollmentStats) enrollmentMap[row.course_id] = Number(row.approved_count);

    const courseStats = paidCourseStats.map(c => ({
      ...c,
      approved_count: enrollmentMap[c.course_id] || 0,
    })).sort((a, b) => Number(b.revenue) - Number(a.revenue));

    const totalStudents = Object.values(enrollmentMap).reduce((s, n) => s + n, 0);

    // 10 giao dịch gần nhất từ instructor_transactions (credits)
    const [recentTransactions] = await db.query(`
      SELECT
        it.id, it.amount, it.description, it.status AS tx_status,
        it.hold_until, it.created_at,
        oi.course_id,
        c.title AS course_title,
        o.user_id AS student_user_id,
        u.full_name AS student_name, u.username AS student_username
      FROM instructor_transactions it
      LEFT JOIN order_items oi ON it.related_order_item_id = oi.id
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN courses c ON oi.course_id = c.id
      WHERE it.instructor_id = ? AND it.type = 'credit'
      ORDER BY it.created_at DESC
      LIMIT 10
    `, [instructor_id]);

    res.json({
      message: 'Lấy thống kê doanh thu thành công',
      total_revenue: totalRevenue,
      total_withdrawn: totalWithdrawn,
      available_balance: availableBalance,
      holding_balance: holdingBalance,
      total_students: totalStudents,
      course_stats: courseStats,
      recent_transactions: recentTransactions,
    });
  } catch (error) {
    console.error('Get earnings error:', error);
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
  // Quiz Questions
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  // My Enrollments
  getMyEnrollments,
  approveEnrollment,
  rejectEnrollment,
  // Earnings
  getEarnings
};
