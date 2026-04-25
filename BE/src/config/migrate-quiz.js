const db = require('./database');

/**
 * Migration: Thêm lesson_type vào lessons, tạo bảng quiz_questions
 * Chạy: node BE/src/config/migrate-quiz.js
 */
async function migrate() {
  try {
    console.log('🔧 Running quiz migration...');

    // 1. Thêm cột lesson_type vào bảng lessons (nếu chưa có)
    const [cols] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'lessons'
        AND COLUMN_NAME = 'lesson_type'
    `);

    if (cols.length === 0) {
      await db.query(`
        ALTER TABLE lessons
        ADD COLUMN lesson_type ENUM('text', 'video', 'quiz') NOT NULL DEFAULT 'text'
        AFTER video_url
      `);
      console.log('✅ Added lesson_type column to lessons');
    } else {
      console.log('⏭️  lesson_type column already exists');
    }

    // 2. Tạo bảng quiz_questions
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
    console.log('✅ Table quiz_questions ready');

    // 3. Index
    try {
      await db.query('CREATE INDEX idx_quiz_questions_lesson ON quiz_questions(lesson_id)');
      console.log('✅ Index created');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
    }

    console.log('🎉 Quiz migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
