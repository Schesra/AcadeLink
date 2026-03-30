/**
 * Middleware kiểm tra role của user
 * Sử dụng sau middleware authenticateToken
 * 
 * @param {Array<string>} allowedRoles - Danh sách roles được phép truy cập
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/admin/users', authenticateToken, checkRole(['admin']), getUsers);
 * router.get('/instructor/courses', authenticateToken, checkRole(['instructor', 'admin']), getCourses);
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user được gắn bởi authenticateToken middleware
    if (!req.user || !req.user.roles) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Vui lòng đăng nhập để tiếp tục' 
      });
    }

    // Kiểm tra xem user có ít nhất 1 role trong allowedRoles không
    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Bạn không có quyền truy cập tài nguyên này' 
      });
    }

    next();
  };
};

module.exports = checkRole;
