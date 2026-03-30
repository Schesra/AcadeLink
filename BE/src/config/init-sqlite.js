const db = require('./database.sqlite');

/**
 * Khởi tạo database SQLite với schema
 * Chuyển từ MySQL sang SQLite syntax
 */
async function initDatabase() {
  try {
    console.log('🔧 Initializing SQLite database...');

    // 1. Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: users');

    // 2. UserRoles Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'instructor', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, role)
      )
    `);
    console.log('✅ Table: user_roles');

    // 3. RefreshTokens Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table: refresh_tokens');

    // 4. Categories Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: categories');

    // 5. Courses Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        instructor_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL DEFAULT 0.00,
        thumbnail_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      )
    `);
    console.log('✅ Table: courses');

    // 6. Lessons Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        video_url TEXT,
        "order" INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table: lessons');

    // 7. Enrollments Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(user_id, course_id)
      )
    `);
    console.log('✅ Table: enrollments');

    // 8. Create Indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id)');
    console.log('✅ Indexes created');

    console.log('🎉 Database initialized successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Chạy nếu file này được execute trực tiếp
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
