const fs = require('fs');
const path = require('path');

// Simple LCOV parser to debug
function parseLcov(raw) {
  const fileCoverage = {};
  let currentFile = '';
  let totalLines = 0;
  let coveredLines = 0;

  raw.split(/\r?\n/).forEach((line) => {
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3).trim();
      console.log('Found file:', currentFile);
      fileCoverage[currentFile] = 0;
    } else if (line.startsWith('DA:')) {
      const parts = line.substring(3).split(',');
      const hits = parseInt(parts[1] || '0', 10);
      totalLines++;
      if (hits > 0) {
        coveredLines++;
        fileCoverage[currentFile] = (fileCoverage[currentFile] || 0) + 1;
      }
    }
  });

  const totalCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  console.log('Total lines:', totalLines);
  console.log('Covered lines:', coveredLines);
  console.log('Total coverage:', totalCoverage + '%');

  return { totalCoverage, fileCoverage };
}

// Read the LCOV file
const lcovPath = path.join(__dirname, 'tests/coverage/lcov.info');
console.log('Reading LCOV from:', lcovPath);

if (fs.existsSync(lcovPath)) {
  const data = fs.readFileSync(lcovPath, 'utf-8');
  const result = parseLcov(data);
  console.log('Result:', result);
} else {
  console.log('LCOV file not found at:', lcovPath);
}
