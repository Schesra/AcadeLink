const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tạo database file trong thư mục BE
const dbPath = path.join(__dirname, '../../acadelink.db');

// Tạo connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ SQLite database connected:', dbPath);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Wrapper để dùng Promise (giống mysql2/promise)
const promiseDb = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      // Phân biệt SELECT vs INSERT/UPDATE/DELETE
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve([rows]); // Trả về format giống mysql2: [rows, fields]
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
        });
      }
    });
  },
  
  // Đóng connection
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = promiseDb;
