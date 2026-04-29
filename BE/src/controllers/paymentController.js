const db = require('../config/database');
const { createNotification } = require('./notificationController');

const PLATFORM_FEE_PERCENT = 20;
const PLATFORM_BANK = {
  bank_id: 'VCB',
  account_no: '1234567890',
  account_name: 'ACADELINK PLATFORM',
  template: 'compact2',
};
const HOLD_DAYS = 7;

function buildVietQRUrl(amount, orderCode) {
  const info = encodeURIComponent(orderCode);
  const name = encodeURIComponent(PLATFORM_BANK.account_name);
  return `https://img.vietqr.io/image/${PLATFORM_BANK.bank_id}-${PLATFORM_BANK.account_no}-${PLATFORM_BANK.template}.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
}

// Internal helper — called by cartController checkout, not exposed as HTTP endpoint directly
async function createOrderFromItems(user_id, paid_items) {
  const total_amount = paid_items.reduce((s, i) => s + Number(i.price), 0);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const [result] = await db.query(
    'INSERT INTO orders (user_id, order_code, total_amount, status) VALUES (?, ?, ?, ?)',
    [user_id, `ACL-${dateStr}-TEMP`, total_amount, 'pending_payment']
  );
  const order_id = result.insertId;
  const order_code = `ACL-${dateStr}-${String(order_id).padStart(6, '0')}`;
  await db.query('UPDATE orders SET order_code = ? WHERE id = ?', [order_code, order_id]);

  // Collect instructor_ids that are admins (full price goes to platform for those)
  const instructorIds = [...new Set(paid_items.map(i => i.instructor_id))];
  const [adminRows] = await db.query(
    `SELECT user_id FROM user_roles WHERE role = 'admin' AND user_id IN (${instructorIds.map(() => '?').join(',')})`,
    instructorIds
  );
  const adminSet = new Set(adminRows.map(r => r.user_id));

  for (const item of paid_items) {
    const price = Number(item.price);
    const isAdminCourse = adminSet.has(item.instructor_id);
    const platform_amount = isAdminCourse ? price : Math.round(price * PLATFORM_FEE_PERCENT) / 100;
    const instructor_amount = isAdminCourse ? 0 : price - platform_amount;
    await db.query(
      'INSERT INTO order_items (order_id, course_id, instructor_id, price, instructor_amount, platform_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [order_id, item.course_id, item.instructor_id, price, instructor_amount, platform_amount]
    );
  }

  return { id: order_id, order_code, total_amount, vietqr_url: buildVietQRUrl(total_amount, order_code) };
}

// GET /api/payment/orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const roles = req.user.roles || [];

    const [[order]] = await db.query(
      'SELECT o.*, u.full_name AS student_name, u.username AS student_username FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [id]
    );
    if (!order) return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy đơn hàng' });

    if (!roles.includes('admin') && order.user_id !== user_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [items] = await db.query(`
      SELECT oi.*, c.title AS course_title, c.thumbnail_url,
        u.full_name AS instructor_name, u.username AS instructor_username
      FROM order_items oi
      JOIN courses c ON oi.course_id = c.id
      JOIN users u ON oi.instructor_id = u.id
      WHERE oi.order_id = ?
    `, [id]);

    res.json({
      order: {
        ...order,
        vietqr_url: buildVietQRUrl(order.total_amount, order.order_code),
        platform_bank: PLATFORM_BANK,
        items,
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/payment/my-orders
const getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT oi.*, c.title AS course_title FROM order_items oi JOIN courses c ON oi.course_id = c.id WHERE oi.order_id = ?',
        [order.id]
      );
      order.items = items;
    }
    res.json({ orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/payment/orders/:id/report
const studentReportPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_note } = req.body;
    const user_id = req.user.user_id;

    const [[order]] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = ?',
      [id, user_id, 'pending_payment']
    );
    if (!order) return res.status(404).json({ error: 'Not found', message: 'Đơn hàng không tồn tại hoặc đã được xử lý' });

    if (payment_note) {
      await db.query('UPDATE orders SET payment_note = ? WHERE id = ?', [payment_note, id]);
    }

    const [[student]] = await db.query('SELECT full_name, username FROM users WHERE id = ?', [user_id]);
    const studentName = student?.full_name || student?.username || 'Học viên';

    const [admins] = await db.query('SELECT user_id FROM user_roles WHERE role = ?', ['admin']);
    for (const admin of admins) {
      await createNotification(
        admin.user_id,
        'payment_reported',
        'Học viên báo đã thanh toán',
        `${studentName} báo đã thanh toán đơn hàng ${order.order_code} - ${Number(order.total_amount).toLocaleString('vi-VN')}₫. Vui lòng xác nhận.`,
        Number(id)
      );
    }

    res.json({ message: 'Đã gửi xác nhận. Admin sẽ kiểm tra và duyệt trong vài phút.' });
  } catch (error) {
    console.error('Report payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/payment/admin/orders/:id/confirm  (admin only)
const adminConfirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const admin_id = req.user.user_id;

    const [[order]] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND status = ?',
      [id, 'pending_payment']
    );
    if (!order) return res.status(404).json({ error: 'Not found', message: 'Đơn hàng không tồn tại hoặc đã được xử lý' });

    await db.query(
      'UPDATE orders SET status = ?, confirmed_by = ?, confirmed_at = NOW(), updated_at = NOW() WHERE id = ?',
      ['paid', admin_id, id]
    );

    const [items] = await db.query(`
      SELECT oi.*, c.title AS course_title
      FROM order_items oi
      JOIN courses c ON oi.course_id = c.id
      WHERE oi.order_id = ?
    `, [id]);

    for (const item of items) {
      // Create approved enrollment (skip if already enrolled)
      const [existing] = await db.query(
        'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
        [order.user_id, item.course_id]
      );
      if (existing.length === 0) {
        await db.query(
          'INSERT INTO enrollments (user_id, course_id, status, enrolled_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [order.user_id, item.course_id, 'approved']
        );
      } else {
        await db.query(
          'UPDATE enrollments SET status = ?, updated_at = NOW() WHERE user_id = ? AND course_id = ?',
          ['approved', order.user_id, item.course_id]
        );
      }

      // Credit instructor transaction (skip if admin owns the course — full amount is platform revenue)
      if (Number(item.instructor_amount) > 0) {
        await db.query(
          `INSERT INTO instructor_transactions
            (instructor_id, type, amount, description, related_order_item_id, status)
           VALUES (?, 'credit', ?, ?, ?, 'available')`,
          [
            item.instructor_id,
            item.instructor_amount,
            `Doanh thu từ khóa học "${item.course_title}" - Đơn ${order.order_code}`,
            item.id,
          ]
        );

        // Notify instructor
        await createNotification(
          item.instructor_id,
          'new_sale',
          'Bạn có doanh thu mới 💰',
          `${Number(item.instructor_amount).toLocaleString('vi-VN')}₫ từ khóa học "${item.course_title}" (đơn ${order.order_code}) đã được ghi vào số dư của bạn.`,
          Number(id)
        );
      }
    }

    // Notify student: payment confirmed
    await createNotification(
      order.user_id,
      'payment_confirmed',
      'Thanh toán được xác nhận ✅',
      `Đơn hàng ${order.order_code} đã được xác nhận. Bạn có thể bắt đầu học ngay!`,
      Number(id)
    );

    res.json({ message: `Đã xác nhận thanh toán đơn hàng ${order.order_code}` });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/payment/admin/orders/:id/cancel  (admin only)
const adminCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [[order]] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND status = ?',
      [id, 'pending_payment']
    );
    if (!order) return res.status(404).json({ error: 'Not found', message: 'Đơn hàng không tồn tại hoặc đã được xử lý' });

    await db.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', ['cancelled', id]);

    await createNotification(
      order.user_id,
      'payment_cancelled',
      'Đơn hàng bị hủy ❌',
      `Đơn hàng ${order.order_code} đã bị hủy. Vui lòng liên hệ hỗ trợ nếu cần.`,
      Number(id)
    );

    res.json({ message: `Đã hủy đơn hàng ${order.order_code}` });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/payment/admin/orders  (admin only)
const adminGetAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, u.full_name AS student_name, u.username AS student_username,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.query(query, params);

    for (const order of orders) {
      const [items] = await db.query(
        'SELECT oi.*, c.title AS course_title FROM order_items oi JOIN courses c ON oi.course_id = c.id WHERE oi.order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    res.json({ orders });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/payment/admin/balance  (admin only)
const adminGetBalance = async (req, res) => {
  try {
    // Tổng phí nền tảng từ các đơn đã paid
    const [[earnRow]] = await db.query(`
      SELECT COALESCE(SUM(oi.platform_amount), 0) AS total_platform_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
    `);

    // Tổng đã rút
    const [[withdrawnRow]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_withdrawn FROM admin_withdrawals'
    );

    const totalRevenue = Number(earnRow.total_platform_revenue);
    const totalWithdrawn = Number(withdrawnRow.total_withdrawn);
    const availableBalance = totalRevenue - totalWithdrawn;

    // Lịch sử rút gần nhất
    const [withdrawalHistory] = await db.query(
      'SELECT * FROM admin_withdrawals ORDER BY created_at DESC LIMIT 20'
    );

    res.json({ total_platform_revenue: totalRevenue, total_withdrawn: totalWithdrawn, available_balance: availableBalance, withdrawal_history: withdrawalHistory });
  } catch (error) {
    console.error('Admin get balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/payment/admin/withdraw  (admin only)
const adminCreateWithdrawal = async (req, res) => {
  try {
    const admin_id = req.user.user_id;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount', message: 'Số tiền rút phải lớn hơn 0' });
    }
    if (Number(amount) < 50000) {
      return res.status(400).json({ error: 'Min amount', message: 'Số tiền rút tối thiểu là 50.000₫' });
    }

    // Kiểm tra tài khoản ngân hàng (dùng chung bảng instructor_bank_accounts)
    const [bankRows] = await db.query(
      'SELECT bank_name, bank_account, account_name FROM instructor_bank_accounts WHERE instructor_id = ?',
      [admin_id]
    );
    if (bankRows.length === 0) {
      return res.status(400).json({ error: 'No bank account', message: 'Bạn chưa liên kết tài khoản ngân hàng' });
    }
    const bank = bankRows[0];

    // Tính số dư khả dụng
    const [[earnRow]] = await db.query(`
      SELECT COALESCE(SUM(oi.platform_amount), 0) AS total_platform_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
    `);
    const [[withdrawnRow]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_withdrawn FROM admin_withdrawals'
    );

    const available = Number(earnRow.total_platform_revenue) - Number(withdrawnRow.total_withdrawn);
    if (Number(amount) > available) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: `Số dư khả dụng không đủ. Số dư hiện tại: ${available.toLocaleString('vi-VN')}₫`
      });
    }

    // Tạo bản ghi rút tiền (auto-complete, admin không cần duyệt)
    await db.query(
      'INSERT INTO admin_withdrawals (admin_id, amount, bank_name, bank_account, account_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [admin_id, amount, bank.bank_name, bank.bank_account, bank.account_name, 'completed']
    );

    res.status(201).json({
      message: `Rút tiền thành công! ${Number(amount).toLocaleString('vi-VN')}₫ đã được chuyển đến tài khoản của bạn.`
    });
  } catch (error) {
    console.error('Admin create withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrderFromItems,
  getOrderById,
  getMyOrders,
  studentReportPayment,
  adminConfirmPayment,
  adminCancelOrder,
  adminGetAllOrders,
  adminGetBalance,
  adminCreateWithdrawal,
};
