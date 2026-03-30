const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database.sqlite');

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

module.exports = {
  register,
  login,
  adminLogin
};
