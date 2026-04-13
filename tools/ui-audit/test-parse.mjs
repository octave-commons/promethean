import { parse } from '@typescript-eslint/typescript-estree';
import { readFileSync } from 'fs';

const content = readFileSync('../../orgs/anomalyco/opencode/orgs/open-hax/uxx/src/components/button.tsx', 'utf-8');

try {
  const ast = parse(content, { jsx: true, loc: true, tolerant: true });
  
  function walk(node, visitor) {
    if (!node || typeof node !== 'object') return;
    visitor(node);
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) walk(item, visitor);
      } else if (child && typeof child === 'object') {
        walk(child, visitor);
      }
    }
  }
  
  const functions = [];
  const jsxElements = [];
  
  walk(ast, (node) => {
    if (node.type === 'FunctionDeclaration' && node.id?.name) {
      functions.push({ name: node.id.name, type: 'function' });
    }
    if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier' && node.id.name[0] === node.id.name[0].toUpperCase()) {
      functions.push({ name: node.id.name, type: 'variable' });
    }
    if (node.type === 'JSXElement' && node.openingElement?.name) {
      const name = node.openingElement.name;
      if (name.type === 'JSXIdentifier') {
        jsxElements.push(name.name);
      } else if (name.type === 'JSXMemberExpression') {
        jsxElements.push(`${name.object.name}.${name.property.name}`);
      }
    }
  });
  
  console.log('Functions found:', functions);
  console.log('JSX elements:', [...new Set(jsxElements)]);
} catch (e) {
  console.error('Parse error:', e.message);
}
