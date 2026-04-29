const db = require('../config/database');
const { createNotification } = require('./notificationController');

/**
 * Tạo ticket hỗ trợ
 * POST /api/support/tickets
 */
const createTicket = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { subject, description, course_id } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Missing fields', message: 'Tiêu đề và mô tả là bắt buộc' });
    }

    const [result] = await db.query(
      'INSERT INTO support_tickets (user_id, course_id, subject, description) VALUES (?, ?, ?, ?)',
      [user_id, course_id || null, subject, description]
    );

    const ticketId = result.insertId;

    // Notify tất cả admin
    const [[sender]] = await db.query('SELECT full_name, username FROM users WHERE id = ?', [user_id]);
    const senderName = sender?.full_name || sender?.username || 'Người dùng';
    const [admins] = await db.query('SELECT user_id FROM user_roles WHERE role = ?', ['admin']);
    for (const admin of admins) {
      await createNotification(
        admin.user_id,
        'new_support_ticket',
        'Yêu cầu hỗ trợ mới',
        `${senderName} vừa gửi yêu cầu hỗ trợ: "${subject}". Hãy phản hồi sớm nhất có thể.`,
        ticketId
      );
    }

    res.status(201).json({ message: 'Gửi yêu cầu hỗ trợ thành công', ticket_id: ticketId });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Lấy danh sách ticket của user
 * GET /api/support/tickets
 */
const getMyTickets = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [tickets] = await db.query(`
      SELECT st.id, st.subject, st.description, st.status, st.created_at, st.updated_at,
             c.title as course_title
      FROM support_tickets st
      LEFT JOIN courses c ON st.course_id = c.id
      WHERE st.user_id = ?
      ORDER BY st.created_at DESC
    `, [user_id]);

    res.json({ message: 'Lấy danh sách ticket thành công', tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== ADMIN ====================

/**
 * Admin: Lấy tất cả tickets
 * GET /api/admin/support/tickets
 */
const getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT st.id, st.subject, st.description, st.status, st.created_at, st.updated_at,
             u.full_name, u.email, c.title as course_title
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN courses c ON st.course_id = c.id
    `;
    const params = [];
    if (status) { query += ' WHERE st.status = ?'; params.push(status); }
    query += ' ORDER BY st.created_at DESC';

    const [tickets] = await db.query(query, params);
    res.json({ message: 'Lấy danh sách ticket thành công', total: tickets.length, tickets });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Admin: Cập nhật trạng thái ticket
 * PUT /api/admin/support/tickets/:id
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', message: 'Trạng thái không hợp lệ' });
    }

    const [result] = await db.query(
      'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Không tìm thấy ticket' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createTicket, getMyTickets, getAllTickets, updateTicketStatus };
