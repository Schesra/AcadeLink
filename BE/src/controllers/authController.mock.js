const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock database - lưu trong memory
let mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@acadelink.com',
    password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', // password: admin123
    full_name: 'Admin User',
    roles: ['admin', 'instructor']
  },
  {
    id: 2,
    username: 'student1',
    email: 'student1@example.com',
    password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', // password: student123
    full_name: 'Student One',
    roles: ['student']
  }
];

let nextUserId = 3;

/**
 * MOCK - Đăng ký tài khoản mới
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
    const existingEmail = mockUsers.find(u => u.email === email);
    if (existingEmail) {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'Email này đã được đăng ký' 
      });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = mockUsers.find(u => u.username === username);
    if (existingUsername) {
      return res.status(409).json({ 
        error: 'Username already exists',
        message: 'Username này đã được sử dụng' 
      });
    }

    // Hash password với bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const newUser = {
      id: nextUserId++,
      username,
      email,
      password_hash,
      full_name: full_name || null,
      roles: ['student'] // Mặc định là student
    };

    mockUsers.push(newUser);

    res.status(201).json({
      message: 'Đăng ký thành công (MOCK MODE)',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        roles: newUser.roles
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
 * MOCK - Đăng nhập (Student/Instructor)
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
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // So sánh password bằng bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        roles: user.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công (MOCK MODE)',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        roles: user.roles
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
 * MOCK - Đăng nhập Admin
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
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // So sánh password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Kiểm tra có role admin không
    if (!user.roles.includes('admin')) {
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
        roles: user.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Đăng nhập Admin thành công (MOCK MODE)',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        roles: user.roles
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
 * MOCK - Xem danh sách users (để debug)
 * GET /api/auth/mock/users
 */
const getMockUsers = (req, res) => {
  res.json({
    message: 'Mock users list',
    total: mockUsers.length,
    users: mockUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      full_name: u.full_name,
      roles: u.roles
    }))
  });
};

module.exports = {
  register,
  login,
  adminLogin,
  getMockUsers
};
