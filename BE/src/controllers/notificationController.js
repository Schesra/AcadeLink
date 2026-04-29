const db = require('../config/database');

/**
 * Lấy danh sách thông báo của user
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [notifications] = await db.query(`
      SELECT id, type, title, message, is_read, related_id, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [user_id]);

    const [[{ unread_count }]] = await db.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );

    res.json({ message: 'Lấy thông báo thành công', unread_count, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Đánh dấu đã đọc một thông báo
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    res.json({ message: 'Đã đánh dấu đọc' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Đánh dấu tất cả đã đọc
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );

    res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Helper: Tạo thông báo (dùng nội bộ)
 */
const createNotification = async (user_id, type, title, message, related_id = null) => {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
      [user_id, type, title, message, related_id]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
