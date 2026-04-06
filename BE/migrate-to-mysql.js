/**
 * Migration Script: SQLite to MySQL
 * 
 * Script này giúp migrate dữ liệu từ SQLite sang MySQL
 * 
 * Usage:
 *   node migrate-to-mysql.js
 */

const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
require('dotenv').config();

// SQLite connection
const sqliteDb = new sqlite3.Database('./acadelink.db');

// MySQL connection config
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'acadelink_db',
  port: process.env.DB_PORT || 3306
};

/**
 * Helper function to query SQLite
 */
function querySQLite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Main migration function
 */
async function migrate() {
  let mysqlConn;
  
  try {
    console.log('🚀 Starting migration from SQLite to MySQL...\n');

    // Connect to MySQL
    console.log('📡 Connecting to MySQL...');
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL connected\n');

    // 1. Migrate Users
    console.log('👥 Migrating users...');
    const users = await querySQLite('SELECT * FROM users');
    for (const user of users) {
      await mysqlConn.query(
        `INSERT IGNORE INTO users (id, username, email, password_hash, full_name, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.username, user.email, user.password_hash, user.full_name, user.created_at, user.updated_at]
      );
    }
    console.log(`✅ Migrated ${users.length} users\n`);

    // 2. Migrate User Roles
    console.log('🎭 Migrating user roles...');
    const userRoles = await querySQLite('SELECT * FROM user_roles');
    for (const role of userRoles) {
      await mysqlConn.query(
        `INSERT IGNORE INTO user_roles (id, user_id, role, created_at) 
         VALUES (?, ?, ?, ?)`,
        [role.id, role.user_id, role.role, role.created_at]
      );
    }
    console.log(`✅ Migrated ${userRoles.length} user roles\n`);

    // 3. Migrate Categories
    console.log('📁 Migrating categories...');
    const categories = await querySQLite('SELECT * FROM categories');
    for (const cat of categories) {
      await mysqlConn.query(
        `INSERT IGNORE INTO categories (id, category_name, description, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [cat.id, cat.category_name, cat.description, cat.created_at, cat.updated_at]
      );
    }
    console.log(`✅ Migrated ${categories.length} categories\n`);

    // 4. Migrate Courses
    console.log('📚 Migrating courses...');
    const courses = await querySQLite('SELECT * FROM courses');
    for (const course of courses) {
      await mysqlConn.query(
        `INSERT IGNORE INTO courses (id, instructor_id, category_id, title, description, price, thumbnail_url, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [course.id, course.instructor_id, course.category_id, course.title, course.description, course.price, course.thumbnail_url, course.created_at, course.updated_at]
      );
    }
    console.log(`✅ Migrated ${courses.length} courses\n`);

    // 5. Migrate Lessons
    console.log('📖 Migrating lessons...');
    const lessons = await querySQLite('SELECT * FROM lessons');
    for (const lesson of lessons) {
      await mysqlConn.query(
        `INSERT IGNORE INTO lessons (id, course_id, title, content, video_url, \`order\`, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [lesson.id, lesson.course_id, lesson.title, lesson.content, lesson.video_url, lesson.order, lesson.created_at, lesson.updated_at]
      );
    }
    console.log(`✅ Migrated ${lessons.length} lessons\n`);

    // 6. Migrate Enrollments
    console.log('✍️ Migrating enrollments...');
    const enrollments = await querySQLite('SELECT * FROM enrollments');
    for (const enrollment of enrollments) {
      await mysqlConn.query(
        `INSERT IGNORE INTO enrollments (id, user_id, course_id, status, enrolled_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [enrollment.id, enrollment.user_id, enrollment.course_id, enrollment.status, enrollment.enrolled_at, enrollment.updated_at]
      );
    }
    console.log(`✅ Migrated ${enrollments.length} enrollments\n`);

    // 7. Migrate Refresh Tokens (if exists)
    console.log('🔑 Migrating refresh tokens...');
    try {
      const tokens = await querySQLite('SELECT * FROM refresh_tokens');
      for (const token of tokens) {
        await mysqlConn.query(
          `INSERT IGNORE INTO refresh_tokens (id, user_id, token, expires_at, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [token.id, token.user_id, token.token, token.expires_at, token.created_at]
        );
      }
      console.log(`✅ Migrated ${tokens.length} refresh tokens\n`);
    } catch (err) {
      console.log('⚠️ No refresh tokens to migrate (table might be empty)\n');
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - User Roles: ${userRoles.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Lessons: ${lessons.length}`);
    console.log(`   - Enrollments: ${enrollments.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    if (mysqlConn) await mysqlConn.end();
    sqliteDb.close();
  }
}

// Run migration
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Error:', err);
      process.exit(1);
    });
}

module.exports = migrate;
