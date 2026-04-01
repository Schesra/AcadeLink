const db = require('./database.sqlite');
const bcrypt = require('bcrypt');

/**
 * Seed dữ liệu mẫu vào SQLite database
 */
async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // 1. Tạo users
    const password = await bcrypt.hash('Password123@', 10);
    
    await db.query(`
      INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name)
      VALUES 
        (1, 'admin', 'admin@acadelink.com', ?, 'Admin User'),
        (2, 'instructor1', 'instructor1@acadelink.com', ?, 'Instructor One'),
        (3, 'student1', 'student1@acadelink.com', ?, 'Student One'),
        (4, 'student2', 'student2@acadelink.com', ?, 'Student Two')
    `, [password, password, password, password]);
    console.log('✅ Users seeded');

    // 2. Tạo user roles
    await db.query(`
      INSERT OR IGNORE INTO user_roles (user_id, role)
      VALUES 
        (1, 'admin'),
        (1, 'instructor'),
        (2, 'instructor'),
        (3, 'student'),
        (4, 'student')
    `);
    console.log('✅ User roles seeded');

    // 3. Tạo categories
    await db.query(`
      INSERT OR IGNORE INTO categories (id, category_name, description)
      VALUES 
        (1, 'Programming', 'Learn programming languages and frameworks'),
        (2, 'Design', 'Graphic design, UI/UX, and creative skills'),
        (3, 'Business', 'Business management and entrepreneurship'),
        (4, 'Marketing', 'Digital marketing and social media')
    `);
    console.log('✅ Categories seeded');

    // 4. Tạo courses
    await db.query(`
      INSERT OR IGNORE INTO courses (id, instructor_id, category_id, title, description, price)
      VALUES 
        (1, 2, 1, 'JavaScript Fundamentals', 'Learn JavaScript from scratch', 99.99),
        (2, 2, 1, 'React for Beginners', 'Build modern web apps with React', 149.99),
        (3, 1, 2, 'UI/UX Design Basics', 'Learn design principles', 79.99),
        (4, 1, 3, 'Startup 101', 'How to start your own business', 199.99)
    `);
    console.log('✅ Courses seeded');

    // 5. Tạo lessons
    await db.query(`
      INSERT OR IGNORE INTO lessons (id, course_id, title, content, "order")
      VALUES 
        (1, 1, 'Introduction to JavaScript', 'What is JavaScript?', 1),
        (2, 1, 'Variables and Data Types', 'Learn about variables', 2),
        (3, 1, 'Functions', 'How to write functions', 3),
        (4, 2, 'Introduction to React', 'What is React?', 1),
        (5, 2, 'Components', 'Learn about React components', 2),
        (6, 3, 'Design Principles', 'Basic design principles', 1),
        (7, 4, 'Business Planning', 'How to plan your business', 1)
    `);
    console.log('✅ Lessons seeded');

    // 6. Tạo enrollments
    await db.query(`
      INSERT OR IGNORE INTO enrollments (id, user_id, course_id, status)
      VALUES 
        (1, 3, 1, 'approved'),
        (2, 3, 2, 'pending'),
        (3, 4, 1, 'approved'),
        (4, 4, 3, 'approved')
    `);
    console.log('✅ Enrollments seeded');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Test accounts:');
    console.log('   Admin: admin@acadelink.com / Password123@');
    console.log('   Instructor: instructor1@acadelink.com / Password123@');
    console.log('   Student: student1@acadelink.com / Password123@');
    console.log('\n📊 Enrollments for testing:');
    console.log('   - Enrollment 2 (student1 → React): PENDING - use for approve/reject tests');
    console.log('   - instructor1 courses: Course 1 (JS), Course 2 (React)');
    console.log('   - Query: GET /api/instructor/enrollments?course_id=2&status=pending');
    
    return true;

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Chạy nếu file này được execute trực tiếp
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
