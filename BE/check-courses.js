const db = require('./src/config/database');

async function check() {
  const [courses] = await db.query('SELECT id, title FROM courses ORDER BY id');
  const [lessons] = await db.query('SELECT course_id, COUNT(*) as count FROM lessons GROUP BY course_id');
  
  console.log('TOTAL COURSES:', courses.length);
  const lessonMap = {};
  lessons.forEach(l => { lessonMap[l.course_id] = l.count; });
  courses.forEach(c => {
    console.log('Course ' + c.id + ': ' + c.title + ' => ' + (lessonMap[c.id] || 0) + ' lessons');
  });
  process.exit(0);
}

check().catch(e => { console.error(e.message); process.exit(1); });
