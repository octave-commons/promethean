import { loadFile } from 'nbb';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const validationPath = path.resolve(__dirname, 'dist/clojure/validation.clj');

console.log('Loading validation file from:', validationPath);

try {
  const functions = await loadFile(validationPath);
  console.log('Loaded functions:', typeof functions);
  console.log('Keys:', Object.keys(functions || {}));
  console.log('validateTask exists:', 'validateTask' in (functions || {}));
  console.log('validate-board exists:', 'validateBoard' in (functions || {}));
  console.log('evaluate-transition-rule exists:', 'evaluate-transition-rule' in (functions || {}));

  if (functions) {
    console.log('Function details:');
    for (const [key, value] of Object.entries(functions)) {
      console.log(`  ${key}:`, typeof value);
    }
  }
} catch (error) {
  console.error('Error loading file:', error);
}
