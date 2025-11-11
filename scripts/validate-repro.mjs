import {
  validateAndSanitizeFilename,
  validateAndSanitizePath,
} from '../packages/shadow-conf/dist/security-utils.js';

const filenames = [
  "<script>alert('xss')</script>.mjs",
  "javascript:alert('xss').mjs",
  "'; DROP TABLE apps; --.mjs",
  '$(rm -rf /).mjs',
  '`whoami`.mjs',
  'CON.mjs',
  'file/with/slashes.mjs',
  'normal-file.mjs',
  '..\\evil.mjs',
];

console.log('== Filename validation repro ==');
for (const f of filenames) {
  try {
    const res = validateAndSanitizeFilename(f, { allowDots: true });
    console.log('PASS:', f, '=>', res);
  } catch (err) {
    console.log('THROW:', f, '=>', err && err.message ? err.message : String(err));
  }
}

const paths = [
  '{:apps [{:name "app" :script "../../../etc/passwd"}]}',
  '../../../etc',
  '..%2f..%2fetc',
  '/absolute/path/to/file',
  'nested/dir/../file',
  '../..\\windows\\path',
];

console.log('\n== Path validation repro ==');
for (const p of paths) {
  try {
    const res = validateAndSanitizePath(p, 'test', undefined, false);
    console.log('PASS:', p, '=>', res);
  } catch (err) {
    console.log('THROW:', p, '=>', err && err.message ? err.message : String(err));
  }
}
