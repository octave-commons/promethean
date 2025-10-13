const fs = require('fs');
const path = require('path');

module.exports = {
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: 'coverage',
  exclude: [
    'coverage/**',
    'dist/**',
    'node_modules/**',
    '**/*.test.js',
    '**/*.test.ts',
    '**/*.spec.js',
    '**/*.spec.ts',
    '**/*.config.js',
    '**/*.config.mjs',
    '**/cli/**',
  ],
  include: [
    'packages/*/src/**/*.js',
    'packages/*/src/**/*.ts',
    'services/*/src/**/*.js',
    'services/*/src/**/*.ts',
  ],
  branches: 75,
  functions: 75,
  lines: 75,
  statements: 75,
  clean: true,
  skipFull: false,
  extension: ['.js', '.ts'],
  // Custom hook to merge coverage from different test types
  afterAll: async () => {
    const coverageDir = 'coverage';
    const subdirs = ['unit', 'integration', 'e2e'];

    for (const subdir of subdirs) {
      const subdirPath = path.join(coverageDir, subdir);
      const coverageFile = path.join(subdirPath, 'coverage-final.json');

      if (fs.existsSync(coverageFile)) {
        try {
          const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
          // Merge logic would go here - for now just ensure the directory exists
          console.log(`Found coverage for ${subdir} tests`);
        } catch (error) {
          console.warn(`Failed to read coverage from ${coverageFile}:`, error.message);
        }
      }
    }
  },
};
