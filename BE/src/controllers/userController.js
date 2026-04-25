const db = require('../config/database');
const bcrypt = require('bcrypt');

// Auto-migration: add bio column if not exists
(async () => {
  try {
    await db.query('ALTER TABLE users ADD COLUMN bio TEXT NULL');
    console.log('✅ Migration: added bio column to users');
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error('Migration warning:', e.message);
  }
})();

/**
 * GET /api/profile
 */
const getProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const [[user]] = await db.query(
      'SELECT id, username, email, full_name, bio, created_at FROM users WHERE id = ?',
      [user_id]
    );
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const [roleRows] = await db.query('SELECT role FROM user_roles WHERE user_id = ?', [user_id]);

    res.json({ user: { ...user, roles: roleRows.map(r => r.role) } });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
};

/**
 * PUT /api/profile
 */
const updateProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { full_name, bio } = req.body;

    if (!full_name?.trim()) {
      return res.status(400).json({ message: 'Họ và tên không được để trống' });
    }

    await db.query(
      'UPDATE users SET full_name = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [full_name.trim(), bio?.trim() || null, user_id]
    );

    const [[updated]] = await db.query(
      'SELECT id, username, email, full_name, bio FROM users WHERE id = ?',
      [user_id]
    );
    const [roleRows] = await db.query('SELECT role FROM user_roles WHERE user_id = ?', [user_id]);

    res.json({
      message: 'Cập nhật hồ sơ thành công',
      user: { ...updated, roles: roleRows.map(r => r.role) },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
};

/**
 * PUT /api/profile/password
 */
const changePassword = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)',
      });
    }

    const [[row]] = await db.query('SELECT password_hash FROM users WHERE id = ?', [user_id]);
    const valid = await bcrypt.compare(current_password, row.password_hash);
    if (!valid) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await db.query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hash, user_id]
    );

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
