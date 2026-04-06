const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Tạo connection pool để quản lý kết nối hiệu quả
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'acadelink_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Sử dụng promise wrapper để dùng async/await
const promisePool = pool.promise();

// Test connection (comment tạm để test code trước)

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connected successfully');
  connection.release();
});


// console.log('🧪 MOCK MODE: Database connection disabled for testing');

module.exports = promisePool;
