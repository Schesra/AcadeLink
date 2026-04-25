const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { sendPasswordResetEmail } = require('../services/emailService');

/**
 * Đăng ký tài khoản mới
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Username, email và password là bắt buộc' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Email không đúng định dạng' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Mật khẩu phải có ít nhất 8 ký tự' 
      });
    }

    // Validate password format: phải có chữ hoa, chữ thường, số, ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password too weak',
        message: 'Mật khẩu phải chứa ít nhất: 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)' 
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'Email này đã được đăng ký' 
      });
    }

    // Kiểm tra username đã tồn tại chưa
    const [existingUsernames] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsernames.length > 0) {
      return res.status(409).json({ 
        error: 'Username already exists',
        message: 'Username này đã được sử dụng' 
      });
    }

    // Hash password với bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user vào database
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [username, email, password_hash, full_name || null]
    );

    const userId = result.insertId;

    // Tự động gán role 'student' cho user mới
    await db.query(
      'INSERT INTO user_roles (user_id, role, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [userId, 'student']
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: userId,
        username,
        email,
        full_name: full_name || null,
        roles: ['student']
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' 
    });
  }
};

/**
 * Đăng nhập (Student/Instructor)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Username và password là bắt buộc' 
      });
    }

    // Tìm user theo username hoặc email
    const [users] = await db.query(
      'SELECT id, username, email, password_hash, full_name FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    const user = users[0];

    // So sánh password bằng bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Lấy danh sách roles của user
    const [userRoles] = await db.query(
      'SELECT role FROM user_roles WHERE user_id = ?',
      [user.id]
    );

    const roles = userRoles.map(row => row.role);

    // Tạo JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        roles: roles
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        roles
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.' 
    });
  }
};

/**
 * Đăng nhập Admin
 * POST /api/admin/login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Email và password là bắt buộc' 
      });
    }

    // Tìm user theo email
    const [users] = await db.query(
      'SELECT id, username, email, password_hash, full_name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    const user = users[0];

    // So sánh password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Lấy roles
    const [userRoles] = await db.query(
      'SELECT role FROM user_roles WHERE user_id = ?',
      [user.id]
    );

    const roles = userRoles.map(row => row.role);

    // Kiểm tra có role admin không
    if (!roles.includes('admin')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Bạn không có quyền truy cập trang quản trị' 
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        roles: roles
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Đăng nhập Admin thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        roles
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.' 
    });
  }
};

/**
 * Refresh token với roles mới nhất
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Lấy thông tin user mới nhất
    const [users] = await db.query(
      'SELECT id, username, email, full_name FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }

    const user = users[0];

    // Lấy roles mới nhất
    const [userRoles] = await db.query(
      'SELECT role FROM user_roles WHERE user_id = ?',
      [user_id]
    );
    const roles = userRoles.map(r => r.role);

    // Issue token mới
    const token = jwt.sign(
      { user_id: user.id, email: user.email, roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        roles
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
};

/**
 * Gửi mã OTP đặt lại mật khẩu về email
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email', message: 'Vui lòng nhập email' });
    }

    const [users] = await db.query(
      'SELECT id, email, full_name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Email not found', message: 'Email này chưa được đăng ký trong hệ thống' });
    }

    const user = users[0];

    // Xóa OTP cũ chưa dùng
    await db.query(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE',
      [user.id]
    );

    // Tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hết hạn sau 10 phút
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, otp, expiresAt]
    );

    sendPasswordResetEmail(user.email, otp, user.full_name).catch((err) => {
      console.error('Send OTP email error:', err);
    });

    res.json({ message: 'Mã xác thực đã được gửi đến email của bạn' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
  }
};

/**
 * Đặt lại mật khẩu bằng OTP
 * POST /api/auth/reset-password  { email, otp, newPassword }
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Missing fields', message: 'Email, mã OTP và mật khẩu mới là bắt buộc' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password too short', message: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'Password too weak',
        message: 'Mật khẩu phải chứa ít nhất: 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)'
      });
    }

    // Tìm user
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid', message: 'Thông tin không hợp lệ' });
    }

    // Tìm OTP hợp lệ
    const [tokens] = await db.query(
      'SELECT id, expires_at, used FROM password_reset_tokens WHERE user_id = ? AND token = ?',
      [users[0].id, otp]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Invalid OTP', message: 'Mã xác thực không đúng' });
    }

    const record = tokens[0];

    if (record.used) {
      return res.status(400).json({ error: 'OTP used', message: 'Mã xác thực đã được sử dụng rồi' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: 'OTP expired', message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [password_hash, users[0].id]
    );

    await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?', [record.id]);

    res.json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
  }
};

// Giữ lại để tránh lỗi export nhưng không dùng nữa
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token không được cung cấp' });
    }

    const [tokens] = await db.query(
      'SELECT id, expires_at, used FROM password_reset_tokens WHERE token = ?',
      [token]
    );

    if (tokens.length === 0 || tokens[0].used || new Date() > new Date(tokens[0].expires_at)) {
      return res.json({ valid: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ valid: false, message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyResetToken
};
