const fs = require('fs');
const path = require('path');

const files = [
  'src/controllers/instructorController.js',
  'src/controllers/adminController.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace single quotes with backticks for queries containing datetime
  content = content.replace(/'(INSERT|UPDATE|DELETE|SELECT)([^']*datetime\\?\\'now\\'\\?[^']*?)'/g, '`$1$2`');
  
  // Remove escapes
  content = content.replace(/\\\\'now\\\\'/g, "'now'");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${file}`);
});

console.log('🎉 All files fixed!');
