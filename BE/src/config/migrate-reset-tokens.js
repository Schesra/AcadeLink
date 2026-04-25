const db = require('./database');

async function migrate() {
  try {
    console.log('🔧 Creating password_reset_tokens table...');

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

    try {
      await db.query('CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token)');
      await db.query('CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id)');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
    }

    console.log('✅ password_reset_tokens table ready');
    console.log('🎉 Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
