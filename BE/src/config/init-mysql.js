const db = require('./database');

/**
 * Khởi tạo MySQL database với schema
 * Dựa trên ERD_ACADELINK.sql
 */
async function initDatabase() {
  try {
    console.log('🔧 Initializing MySQL database...');

    // 1. Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: users');

    // 2. UserRoles Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        role ENUM('student', 'instructor', 'admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (user_id, role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: user_roles');

    // 3. RefreshTokens Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: refresh_tokens');

    // 4. Categories Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: categories');

    // 5. Courses Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        instructor_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        thumbnail_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: courses');

    // 6. Lessons Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        video_url VARCHAR(500),
        lesson_type ENUM('text', 'video', 'quiz') NOT NULL DEFAULT 'text',
        \`order\` INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: lessons');

    // 6b. Quiz Questions Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        lesson_id INT NOT NULL,
        question TEXT NOT NULL,
        option_a VARCHAR(500) NOT NULL,
        option_b VARCHAR(500) NOT NULL,
        option_c VARCHAR(500),
        option_d VARCHAR(500),
        correct_option CHAR(1) NOT NULL COMMENT 'a, b, c hoặc d',
        \`order\` INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: quiz_questions');

    // 7. Password Reset Tokens Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: password_reset_tokens');

    // 8. Enrollments Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (user_id, course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: enrollments');

    // 9. Reviews Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (user_id, course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: reviews');

    // 10. Lesson Progress Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_progress (user_id, lesson_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: lesson_progress');

    // 11. Notifications Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        related_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: notifications');

    // 12. Cart Items Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cart_item (user_id, course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: cart_items');

    // 13. Instructor Bank Accounts
    await db.query(`
      CREATE TABLE IF NOT EXISTS instructor_bank_accounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        instructor_id INT NOT NULL UNIQUE,
        bank_name VARCHAR(100) NOT NULL,
        bank_account VARCHAR(50) NOT NULL,
        account_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: instructor_bank_accounts');

    // 14. Withdrawal Requests
    await db.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        instructor_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        bank_account VARCHAR(50) NOT NULL,
        account_name VARCHAR(100) NOT NULL,
        status ENUM('processing','completed') NOT NULL DEFAULT 'processing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: withdrawal_requests');

    // 15. Support Tickets Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT DEFAULT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: support_tickets');

    // 16. Orders Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        order_code VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        status ENUM('pending_payment','paid','cancelled') NOT NULL DEFAULT 'pending_payment',
        payment_note TEXT,
        confirmed_by INT DEFAULT NULL,
        confirmed_at TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: orders');

    // 17. Order Items Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        course_id INT NOT NULL,
        instructor_id INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        instructor_amount DECIMAL(10,2) NOT NULL,
        platform_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: order_items');

    // 18. Instructor Transactions Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS instructor_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        instructor_id INT NOT NULL,
        type ENUM('credit','debit') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        description VARCHAR(500) NOT NULL,
        related_order_item_id INT DEFAULT NULL,
        related_withdrawal_id INT DEFAULT NULL,
        status ENUM('holding','available') NOT NULL DEFAULT 'holding',
        hold_until TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (related_order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
        FOREIGN KEY (related_withdrawal_id) REFERENCES withdrawal_requests(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: instructor_transactions');

    // 19. Admin Withdrawals Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_withdrawals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        bank_account VARCHAR(50) NOT NULL,
        account_name VARCHAR(100) NOT NULL,
        status ENUM('completed') NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: admin_withdrawals');

    // Alter withdrawal_requests status enum to support admin approval flow
    try {
      await db.query(`
        ALTER TABLE withdrawal_requests
          MODIFY COLUMN status
          ENUM('pending_admin','approved','completed','rejected')
          NOT NULL DEFAULT 'pending_admin'
      `);
      console.log('✅ Altered: withdrawal_requests.status enum');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME' && !err.message.includes('Duplicate')) {
        console.log('ℹ️  withdrawal_requests.status enum already updated or error:', err.message);
      }
    }

    // 8. Create Indexes (MySQL không hỗ trợ IF NOT EXISTS cho indexes)
    const indexes = [
      'CREATE INDEX idx_user_roles_user ON user_roles(user_id)',
      'CREATE INDEX idx_user_roles_role ON user_roles(role)',
      'CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id)',
      'CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token)',
      'CREATE INDEX idx_courses_instructor ON courses(instructor_id)',
      'CREATE INDEX idx_courses_category ON courses(category_id)',
      'CREATE INDEX idx_lessons_course ON lessons(course_id)',
      'CREATE INDEX idx_lessons_order ON lessons(course_id, `order`)',
      'CREATE INDEX idx_quiz_questions_lesson ON quiz_questions(lesson_id)',
      'CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token)',
      'CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id)',
      'CREATE INDEX idx_enrollments_user ON enrollments(user_id)',
      'CREATE INDEX idx_enrollments_course ON enrollments(course_id)',
      'CREATE INDEX idx_enrollments_status ON enrollments(status)',
      'CREATE INDEX idx_reviews_course ON reviews(course_id)',
      'CREATE INDEX idx_reviews_user ON reviews(user_id)',
      'CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id)',
      'CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id)',
      'CREATE INDEX idx_notifications_user ON notifications(user_id)',
      'CREATE INDEX idx_notifications_read ON notifications(user_id, is_read)',
      'CREATE INDEX idx_support_tickets_user ON support_tickets(user_id)',
      'CREATE INDEX idx_support_tickets_status ON support_tickets(status)',
      'CREATE INDEX idx_cart_items_user ON cart_items(user_id)',
      'CREATE INDEX idx_cart_items_course ON cart_items(course_id)',
      'CREATE INDEX idx_withdrawals_instructor ON withdrawal_requests(instructor_id)',
      'CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status)',
      'CREATE INDEX idx_orders_user ON orders(user_id)',
      'CREATE INDEX idx_orders_status ON orders(status)',
      'CREATE INDEX idx_order_items_order ON order_items(order_id)',
      'CREATE INDEX idx_order_items_course ON order_items(course_id)',
      'CREATE INDEX idx_order_items_instructor ON order_items(instructor_id)',
      'CREATE INDEX idx_itx_instructor ON instructor_transactions(instructor_id)',
      'CREATE INDEX idx_itx_status ON instructor_transactions(status)',
      'CREATE INDEX idx_itx_hold_until ON instructor_transactions(hold_until)',
      'CREATE INDEX idx_admin_withdrawals_admin ON admin_withdrawals(admin_id)'
    ];

    for (const indexQuery of indexes) {
      try {
        await db.query(indexQuery);
      } catch (err) {
        // Ignore error if index already exists
        if (err.code !== 'ER_DUP_KEYNAME') {
          throw err;
        }
      }
    }
    console.log('✅ Indexes created');

    console.log('🎉 MySQL Database initialized successfully!');
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
