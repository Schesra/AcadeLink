const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize SQLite database
const initDatabase = require('./config/init-sqlite');
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const testRoutes = require('./routes/test.routes');
// SQLite MODE: Dùng routes thật với SQLite database
const authRoutes = require('./routes/auth.routes');
const guestRoutes = require('./routes/guest.routes');
const studentRoutes = require('./routes/student.routes');
const instructorRoutes = require('./routes/instructor.routes');
const adminRoutes = require('./routes/admin.routes');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ACADELINK API Server',
    version: '1.0.0',
    status: 'running',
    mode: '💾 SQLite MODE (local database)',
    database: 'acadelink.db',
    endpoints: {
      test: '/api/test',
      auth: '/api/auth (register, login)',
      guest: '/api/courses, /api/categories',
      student: '/api/enrollments, /api/my-courses',
      instructor: '/api/instructor',
      admin: '/api/admin'
    }
  });
});

// API Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', guestRoutes);
app.use('/api', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'Endpoint không tồn tại' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
