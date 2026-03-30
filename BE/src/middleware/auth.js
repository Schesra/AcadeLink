const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header Authorization: Bearer <token>
 * Nếu hợp lệ, gắn user info vào req.user
 */
const authenticateToken = (req, res, next) => {
  // Lấy token từ header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Vui lòng đăng nhập để tiếp tục' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gắn user info vào request
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      roles: decoded.roles
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' 
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'Token không hợp lệ' 
    });
  }
};

module.exports = authenticateToken;
