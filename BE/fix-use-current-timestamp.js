const fs = require('fs');
const path = require('path');

const files = [
  'src/controllers/authController.js',
  'src/controllers/studentController.js',
  'src/controllers/instructorController.js',
  'src/controllers/adminController.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace datetime('now') with CURRENT_TIMESTAMP
  content = content.replace(/datetime\(['"\\]*now['"\\]*\)/g, 'CURRENT_TIMESTAMP');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${file}`);
});

console.log('🎉 All files fixed! Using CURRENT_TIMESTAMP instead.');
