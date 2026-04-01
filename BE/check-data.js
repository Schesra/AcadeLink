const db = require('./src/config/database.sqlite');

/**
 * Script kiểm tra dữ liệu trong database
 * Chạy: node check-data.js
 */

async function checkData() {
  try {
    console.log('\n🔍 KIỂM TRA DỮ LIỆU DATABASE\n');

    // 1. Users
    const [users] = await db.query('SELECT id, username, email FROM users');
    console.log('👥 USERS:', users.length);
    users.forEach(u => console.log(`   - ${u.id}: ${u.username} (${u.email})`));

    // 2. User Roles
    const [roles] = await db.query(`
      SELECT u.username, ur.role 
      FROM user_roles ur 
      JOIN users u ON ur.user_id = u.id
      ORDER BY u.id, ur.role
    `);
    console.log('\n🎭 USER ROLES:', roles.length);
    roles.forEach(r => console.log(`   - ${r.username}: ${r.role}`));

    // 3. Categories
    const [categories] = await db.query('SELECT id, category_name FROM categories');
    console.log('\n📁 CATEGORIES:', categories.length);
    categories.forEach(c => console.log(`   - ${c.id}: ${c.category_name}`));

    // 4. Courses
    const [courses] = await db.query(`
      SELECT c.id, c.title, u.username as instructor 
      FROM courses c 
      JOIN users u ON c.instructor_id = u.id
    `);
    console.log('\n📚 COURSES:', courses.length);
    courses.forEach(c => console.log(`   - ${c.id}: ${c.title} (by ${c.instructor})`));

    // 5. Lessons
    const [lessons] = await db.query(`
      SELECT l.id, l.title, c.title as course 
      FROM lessons l 
      JOIN courses c ON l.course_id = c.id
    `);
    console.log('\n📖 LESSONS:', lessons.length);
    lessons.forEach(l => console.log(`   - ${l.id}: ${l.title} (${l.course})`));

    // 6. Enrollments
    const [enrollments] = await db.query(`
      SELECT 
        e.id, 
        u.username as student, 
        c.title as course,
        c.instructor_id,
        i.username as instructor,
        e.status
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      JOIN users i ON c.instructor_id = i.id
    `);
    console.log('\n✅ ENROLLMENTS:', enrollments.length);
    enrollments.forEach(e => {
      console.log(`   - ${e.id}: ${e.student} → ${e.course} (${e.status}) [instructor: ${e.instructor}]`);
    });

    // 7. Enrollments by Instructor
    console.log('\n👨‍🏫 ENROLLMENTS BY INSTRUCTOR:');
    const [byInstructor] = await db.query(`
      SELECT 
        i.username as instructor,
        c.id as course_id,
        c.title as course,
        COUNT(e.id) as total_enrollments,
        SUM(CASE WHEN e.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN e.status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN e.status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM courses c
      JOIN users i ON c.instructor_id = i.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, i.username, c.title
      ORDER BY i.username, c.id
    `);
    byInstructor.forEach(row => {
      console.log(`   - ${row.instructor} / Course ${row.course_id} (${row.course}):`);
      console.log(`     Total: ${row.total_enrollments}, Pending: ${row.pending}, Approved: ${row.approved}, Rejected: ${row.rejected}`);
    });

    console.log('\n✅ Kiểm tra hoàn tất!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkData();
