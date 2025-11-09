import fs from 'fs';

// Simple test to check if coverage files are readable
console.log('🧪 Testing Coverage File Access\n');

const files = [
  './test-coverage.lcov',
  './test-coverage.json', 
  './test-coverage.xml'
];

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    console.log(`✅ ${file}: ${content.length} characters`);
    
    if (file.endsWith('.json')) {
      const parsed = JSON.parse(content);
      console.log(`   JSON total coverage: ${parsed.total?.lines?.pct}%`);
    }
  } catch (error) {
    console.error(`❌ ${file}: ${error.message}`);
  }
}