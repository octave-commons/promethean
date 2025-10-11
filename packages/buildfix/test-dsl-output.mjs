import { dslToSnippet } from './dist/iter/dsl.js';

const ops = [
  { op: 'ensureExported', file: 'src/test.ts', symbol: 'testFunction', kind: 'function' },
  { op: 'addImport', file: 'src/test.ts', from: 'lodash', names: ['map'] },
];

dslToSnippet(ops)
  .then((snippet) => {
    console.log('Generated snippet:');
    console.log(snippet);
    console.log('\nContains getFunctions():', snippet.includes('getFunctions()'));
    console.log('Contains addImportDeclaration:', snippet.includes('addImportDeclaration'));
    console.log('Contains ensureExported:', snippet.includes('ensureExported'));
    console.log('Contains addImport:', snippet.includes('addImport'));
  })
  .catch(console.error);
