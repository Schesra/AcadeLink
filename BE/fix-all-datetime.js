const fs = require('fs');
const path = require('path');

const files = [
  'src/controllers/instructorController.js',
  'src/controllers/adminController.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all db.query with single quotes containing datetime('now')
  // Replace outer single quotes with double quotes
  content = content.replace(
    /db\.query\(\s*'([^']*datetime\('now'\)[^']*)'/g,
    'db.query("$1"'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${file}`);
});

console.log('🎉 All files fixed!');
