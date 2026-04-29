const db = require('../config/database');
const { createNotification } = require('./notificationController');
const { createOrderFromItems } = require('./paymentController');

/**
 * GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [items] = await db.query(`
      SELECT
        ci.id, ci.added_at,
        c.id AS course_id, c.title, c.description, c.price, c.thumbnail_url,
        cat.category_name,
        u.full_name AS instructor_name, u.username AS instructor_username,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS lesson_count
      FROM cart_items ci
      JOIN courses c ON ci.course_id = c.id
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.instructor_id = u.id
      WHERE ci.user_id = ?
      ORDER BY ci.added_at DESC
    `, [user_id]);

    const total = items.reduce((sum, item) => sum + Number(item.price), 0);

    res.json({ message: 'Lấy giỏ hàng thành công', items, total, count: items.length });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/cart  { course_id }
 */
const addToCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ error: 'Missing field', message: 'course_id là bắt buộc' });
    }

    // Kiểm tra khóa học tồn tại
    const [courses] = await db.query('SELECT id, title FROM courses WHERE id = ?', [course_id]);
    if (courses.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy khóa học' });
    }

    // Kiểm tra đã enrolled chưa
    const [enrolled] = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status IN (?, ?)',
      [user_id, course_id, 'pending', 'approved']
    );
    if (enrolled.length > 0) {
      return res.status(409).json({ error: 'Already enrolled', message: 'Bạn đã đăng ký khóa học này rồi' });
    }

    // Thêm vào giỏ (ignore nếu đã có)
    await db.query(
      'INSERT IGNORE INTO cart_items (user_id, course_id) VALUES (?, ?)',
      [user_id, course_id]
    );

    res.status(201).json({ message: 'Đã thêm vào giỏ hàng', course_id: Number(course_id) });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/cart/:course_id
 */
const removeFromCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { course_id } = req.params;

    await db.query(
      'DELETE FROM cart_items WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    res.json({ message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/cart  — xóa toàn bộ giỏ
 */
const clearCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/cart/checkout
 * - Khóa học miễn phí (price=0): tạo enrollment pending, chờ giảng viên duyệt
 * - Khóa học có phí (price>0): tạo order, chuyển sang trang thanh toán VietQR
 */
const checkout = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [items] = await db.query(`
      SELECT ci.course_id, c.title, c.instructor_id, c.price
      FROM cart_items ci
      JOIN courses c ON ci.course_id = c.id
      WHERE ci.user_id = ?
    `, [user_id]);

    if (items.length === 0) {
      return res.status(400).json({ error: 'Empty cart', message: 'Giỏ hàng trống' });
    }

    const [[student]] = await db.query('SELECT full_name, username FROM users WHERE id = ?', [user_id]);
    const studentName = student?.full_name || student?.username || 'Học viên';
    const [admins] = await db.query('SELECT user_id FROM user_roles WHERE role = ?', ['admin']);

    const freeItems = items.filter(i => Number(i.price) === 0);
    const paidItems = items.filter(i => Number(i.price) > 0);

    // Xử lý khóa học miễn phí (giống luồng cũ)
    const freeResults = [];
    for (const item of freeItems) {
      const [existing] = await db.query(
        'SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?',
        [user_id, item.course_id]
      );
      if (existing.length > 0) {
        freeResults.push({ course_id: item.course_id, title: item.title, status: 'skipped', reason: existing[0].status });
        continue;
      }

      const [result] = await db.query(
        'INSERT INTO enrollments (user_id, course_id, status, enrolled_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [user_id, item.course_id, 'pending']
      );
      const enrollmentId = result.insertId;

      await createNotification(
        item.instructor_id, 'new_enrollment',
        'Có học viên mới đăng ký',
        `${studentName} vừa đăng ký khóa học "${item.title}". Hãy xem xét và duyệt yêu cầu.`,
        enrollmentId
      );
      for (const admin of admins) {
        await createNotification(
          admin.user_id, 'new_enrollment',
          'Yêu cầu ghi danh mới',
          `${studentName} vừa đăng ký khóa học "${item.title}" và đang chờ duyệt.`,
          enrollmentId
        );
      }

      freeResults.push({ course_id: item.course_id, title: item.title, status: 'enrolled', enrollment_id: enrollmentId });
    }

    // Xử lý khóa học có phí — tạo order
    let orderData = null;
    if (paidItems.length > 0) {
      // Lọc những khóa đã enrolled rồi
      const eligiblePaid = [];
      for (const item of paidItems) {
        const [existing] = await db.query(
          'SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ? AND status IN (?, ?)',
          [user_id, item.course_id, 'pending', 'approved']
        );
        if (existing.length === 0) eligiblePaid.push(item);
      }

      if (eligiblePaid.length > 0) {
        orderData = await createOrderFromItems(user_id, eligiblePaid);
      }
    }

    // Xóa giỏ hàng
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);

    const freeEnrolled = freeResults.filter(r => r.status === 'enrolled').length;
    res.json({
      message: orderData
        ? `Đã tạo đơn hàng ${orderData.order_code}. Vui lòng hoàn tất thanh toán.`
        : `Đăng ký thành công ${freeEnrolled}/${freeItems.length} khóa học. Vui lòng chờ giảng viên duyệt.`,
      free_results: freeResults,
      order: orderData,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart, checkout };
