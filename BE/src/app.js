const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const initDatabase = require('./config/init-mysql');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'],
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
const authRoutes = require('./routes/auth.routes');
const guestRoutes = require('./routes/guest.routes');
const studentRoutes = require('./routes/student.routes');
const instructorRoutes = require('./routes/instructor.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');
const reviewRoutes = require('./routes/review.routes');
const progressRoutes = require('./routes/progress.routes');
const notificationRoutes = require('./routes/notification.routes');
const supportRoutes = require('./routes/support.routes');
const cartRoutes = require('./routes/cart.routes');
const paymentRoutes = require('./routes/payment.routes');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ACADELINK API Server',
    version: '1.0.0',
    status: 'running',
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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', guestRoutes);
app.use('/api', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', reviewRoutes);
app.use('/api', progressRoutes);
app.use('/api', notificationRoutes);
app.use('/api', supportRoutes);
app.use('/api', cartRoutes);
app.use('/api/payment', paymentRoutes);

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
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;
