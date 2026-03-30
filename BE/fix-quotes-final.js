const fs = require('fs');
const path = require('path');

const files = [
  'src/controllers/instructorController.js',
  'src/controllers/adminController.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix mismatched quotes: "..." ' -> "..."
  content = content.replace(/"([^"]*CURRENT_TIMESTAMP[^"]*?)'/g, '"$1"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${file}`);
});

console.log('🎉 All quotes fixed!');
