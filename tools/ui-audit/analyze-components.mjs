#!/usr/bin/env node

/**
 * Component Pattern Analysis
 * Extracts component usage patterns from discovered TSX/JSX/CLJS files
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');

// Dynamic import for typescript-estree
let parse = null;

async function initParser() {
  const { parse: tsParse } = await import('@typescript-eslint/typescript-estree');
  parse = tsParse;
}

/**
 * Analyze TSX/JSX file for component usage
 */
function analyzeTsx(filePath, content) {
  const components = {
    defined: [],      // Components defined in this file
    imported: [],     // Components imported from elsewhere
    used: [],         // JSX elements used
    exported: [],     // Components exported
    propsPatterns: [] // Prop patterns observed
  };
  
  try {
    const ast = parse(content, {
      jsx: true,
      loc: true,
      tolerant: true
    });
    
    walkAst(ast, (node) => {
      // Component definitions (function declarations with JSX return)
      if (node.type === 'FunctionDeclaration' && node.id?.name) {
        const name = node.id.name;
        // Heuristic: starts with uppercase = component
        if (name[0] === name[0].toUpperCase()) {
          components.defined.push({
            name,
            type: 'function',
            loc: node.loc?.start
          });
        }
      }
      
      // Arrow function component assignments
      if (node.type === 'VariableDeclarator' && 
          node.id?.type === 'Identifier' &&
          node.init?.type === 'ArrowFunctionExpression') {
        const name = node.id.name;
        if (name[0] === name[0].toUpperCase()) {
          components.defined.push({
            name,
            type: 'arrow',
            loc: node.loc?.start
          });
        }
      }
      
      // JSX elements used
      if (node.type === 'JSXElement' && node.openingElement?.name) {
        const elName = getJsxElementName(node.openingElement.name);
        if (elName) {
          // Filter out native HTML elements
          if (elName[0] === elName[0].toUpperCase()) {
            components.used.push({
              name: elName,
              props: extractProps(node.openingElement.attributes),
              loc: node.loc?.start
            });
          }
        }
      }
      
      // Import declarations
      if (node.type === 'ImportDeclaration' && node.source?.value) {
        const source = node.source.value;
        for (const spec of node.specifiers || []) {
          if (spec.type === 'ImportDefaultSpecifier' || spec.type === 'ImportSpecifier') {
            const name = spec.local?.name || spec.imported?.name;
            if (name && name[0] === name[0].toUpperCase()) {
              components.imported.push({
                name,
                source,
                loc: node.loc?.start
              });
            }
          }
        }
      }
      
      // Export declarations
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration?.type === 'FunctionDeclaration' && node.declaration.id?.name) {
          const name = node.declaration.id.name;
          if (name[0] === name[0].toUpperCase()) {
            components.exported.push({ name, type: 'named' });
          }
        }
        if (node.declaration?.type === 'VariableDeclaration') {
          for (const decl of node.declaration.declarations || []) {
            if (decl.id?.type === 'Identifier') {
              const name = decl.id.name;
              if (name[0] === name[0].toUpperCase()) {
                components.exported.push({ name, type: 'named' });
              }
            }
          }
        }
      }
      
      if (node.type === 'ExportDefaultDeclaration') {
        if (node.declaration?.type === 'Identifier') {
          components.exported.push({ name: node.declaration.name, type: 'default' });
        } else if (node.declaration?.type === 'FunctionDeclaration' && node.declaration.id?.name) {
          components.exported.push({ name: node.declaration.id.name, type: 'default' });
        }
      }
    });
  } catch (e) {
    // Parse error - record it
    return { error: e.message, components };
  }
  
  return { components };
}

/**
 * Walk AST recursively
 */
function walkAst(node, visitor) {
  if (!node || typeof node !== 'object') return;
  
  visitor(node);
  
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        walkAst(item, visitor);
      }
    } else if (child && typeof child === 'object') {
      walkAst(child, visitor);
    }
  }
}

/**
 * Get JSX element name
 */
function getJsxElementName(nameNode) {
  if (!nameNode) return null;
  
  if (nameNode.type === 'JSXIdentifier') {
    return nameNode.name;
  }
  if (nameNode.type === 'JSXMemberExpression') {
    const obj = getJsxElementName(nameNode.object);
    const prop = nameNode.property?.name;
    return obj && prop ? `${obj}.${prop}` : null;
  }
  if (nameNode.type === 'JSXNamespacedName') {
    return `${nameNode.namespace?.name}:${nameNode.name?.name}`;
  }
  return null;
}

/**
 * Extract prop names from JSX attributes
 */
function extractProps(attributes) {
  if (!attributes) return [];
  
  return attributes
    .filter(attr => attr.type === 'JSXAttribute' && attr.name?.type === 'JSXIdentifier')
    .map(attr => ({
      name: attr.name.name,
      hasValue: attr.value !== null,
      valueType: attr.value?.type
    }));
}

/**
 * Analyze CLJS file for Reagent component usage
 */
function analyzeCljs(filePath, content) {
  const components = {
    defined: [],
    used: [],
    reagentForms: [],
    subscriptions: [],
    events: []
  };
  
  // Pattern: defn component name
  const defnPattern = /\(defn\s+([a-z][-a-z0-9]*)/gi;
  let match;
  while ((match = defnPattern.exec(content)) !== null) {
    const name = match[1];
    components.defined.push({ name, type: 'defn' });
  }
  
  // Pattern: defcomponent, defc, defui
  const componentMacroPattern = /\((def(?:component|c|ui))\s+([a-z][-a-z0-9]*)/gi;
  while ((match = componentMacroPattern.exec(content)) !== null) {
    components.defined.push({ name: match[2], type: match[1] });
  }
  
  // Pattern: reagent/create-class
  const createClassPattern = /reagent\/create-class|create-class/g;
  components.reagentForms = [...content.matchAll(createClassPattern)].map(m => m[0]);
  
  // Pattern: with-let, ratom, reaction
  const ratomPattern = /(?:with-let|ratom|reaction|r\/atom|reagent\.core\/atom)/g;
  components.reagentForms.push(...[...content.matchAll(ratomPattern)].map(m => m[0]));
  
  // Pattern: subscribe to re-frame
  const subPattern = /(?:subscribe|<sub!?|\(sub)\s*\[\s*:([a-z][-a-z0-9/-]*)/gi;
  while ((match = subPattern.exec(content)) !== null) {
    components.subscriptions.push(match[1]);
  }
  
  // Pattern: dispatch re-frame events
  const dispatchPattern = /(?:dispatch|>evt!?|\(dispatch)\s*\[\s*:([a-z][-a-z0-9/-]*)/gi;
  while ((match = dispatchPattern.exec(content)) !== null) {
    components.events.push(match[1]);
  }
  
  // Pattern: [:component-name ...] - Reagent hiccup vectors
  // Look for kebab-case keywords in vector position
  const hiccupPattern = /\[:([a-z][a-z0-9-]*)/g;
  const hiccupComponents = new Set();
  while ((match = hiccupPattern.exec(content)) !== null) {
    const name = match[1];
    // Filter out HTML elements and common keywords
    if (!['div', 'span', 'p', 'a', 'button', 'input', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'img', 'svg', 'path',
          'style', 'script', 'meta', 'link', 'head', 'body', 'html', 'text', 'g', 'rect', 'circle',
          'defs', 'polygon', 'line', 'polyline', 'ellipse', 'stop', 'linearGradient', 'radialGradient',
          'view', 'label', 'select', 'option', 'textarea', 'pre', 'code', 'br', 'hr', 'strong', 'em',
          'nav', 'header', 'footer', 'main', 'section', 'article', 'aside', 'figure', 'figcaption',
          'details', 'summary', 'dialog', 'menu', 'menuitem', 'canvas', 'video', 'audio', 'source',
          'track', 'iframe', 'object', 'embed', 'param', 'map', 'area', 'base', 'col', 'colgroup',
          'datalist', 'keygen', 'output', 'progress', 'meter', 'time', 'mark', 'ruby', 'rt', 'rp',
          'bdi', 'bdo', 'wbr', 'picture', 'template', 'slot'].includes(name)) {
      hiccupComponents.add(name);
    }
  }
  components.used = [...hiccupComponents];
  
  return components;
}

/**
 * Main analysis function
 */
async function analyze() {
  console.error('Initializing parser...');
  await initParser();
  
  const discoveredPath = join(ROOT, 'tools', 'ui-audit', 'discovered-files.json');
  const discovered = JSON.parse(readFileSync(discoveredPath, 'utf-8'));
  
  console.error(`Analyzing ${discovered.files.length} files...`);
  
  const analysis = {
    generated: new Date().toISOString(),
    stats: {
      filesAnalyzed: 0,
      parseErrors: 0,
      totalComponents: 0
    },
    components: {
      defined: {},   // name -> [{ file, type }]
      used: {},      // name -> [{ file, props }]
      imported: {},  // name -> [{ file, source }]
      exported: {}   // name -> [{ file }]
    },
    cljs: {
      defined: {},
      used: {},
      subscriptions: {},
      events: {},
      reagentForms: {}
    },
    files: {}
  };
  
  for (const file of discovered.files) {
    const { absPath, repoRelPath, lang } = file;
    
    if (!existsSync(absPath)) continue;
    
    let content;
    try {
      content = readFileSync(absPath, 'utf-8');
    } catch (e) {
      continue;
    }
    
    analysis.stats.filesAnalyzed++;
    
    if (lang === 'tsx' || lang === 'jsx') {
      const result = analyzeTsx(absPath, content);
      
      if (result.error) {
        analysis.stats.parseErrors++;
      }
      
      const comps = result.components || {};
      
      // Record defined components
      for (const comp of (comps.defined || [])) {
        if (!analysis.components.defined[comp.name]) {
          analysis.components.defined[comp.name] = [];
        }
        analysis.components.defined[comp.name].push({
          file: repoRelPath,
          type: comp.type
        });
      }
      
      // Record used components
      for (const comp of (comps.used || [])) {
        if (!analysis.components.used[comp.name]) {
          analysis.components.used[comp.name] = [];
        }
        analysis.components.used[comp.name].push({
          file: repoRelPath,
          props: comp.props
        });
      }
      
      // Record imported components
      for (const comp of (comps.imported || [])) {
        if (!analysis.components.imported[comp.name]) {
          analysis.components.imported[comp.name] = [];
        }
        analysis.components.imported[comp.name].push({
          file: repoRelPath,
          source: comp.source
        });
      }
      
      analysis.files[repoRelPath] = result;
    } else if (lang === 'cljs' || lang === 'cljc') {
      const result = analyzeCljs(absPath, content);
      
      // Record defined CLJS components
      for (const comp of result.defined) {
        if (!analysis.cljs.defined[comp.name]) {
          analysis.cljs.defined[comp.name] = [];
        }
        analysis.cljs.defined[comp.name].push({
          file: repoRelPath,
          type: comp.type
        });
      }
      
      // Record used CLJS components (hiccup keywords)
      for (const name of result.used) {
        if (!analysis.cljs.used[name]) {
          analysis.cljs.used[name] = [];
        }
        analysis.cljs.used[name].push({ file: repoRelPath });
      }
      
      // Record subscriptions
      for (const sub of result.subscriptions) {
        if (!analysis.cljs.subscriptions[sub]) {
          analysis.cljs.subscriptions[sub] = [];
        }
        analysis.cljs.subscriptions[sub].push({ file: repoRelPath });
      }
      
      // Record events
      for (const evt of result.events) {
        if (!analysis.cljs.events[evt]) {
          analysis.cljs.events[evt] = [];
        }
        analysis.cljs.events[evt].push({ file: repoRelPath });
      }
      
      analysis.files[repoRelPath] = result;
    }
  }
  
  // Compute frequencies
  analysis.frequency = {
    tsxJsx: {
      defined: Object.entries(analysis.components.defined)
        .map(([name, usages]) => ({ name, count: usages.length, usages }))
        .sort((a, b) => b.count - a.count),
      used: Object.entries(analysis.components.used)
        .map(([name, usages]) => ({ name, count: usages.length, usages }))
        .sort((a, b) => b.count - a.count),
      imported: Object.entries(analysis.components.imported)
        .map(([name, usages]) => ({ name, count: usages.length, usages }))
        .sort((a, b) => b.count - a.count)
    },
    cljs: {
      defined: Object.entries(analysis.cljs.defined)
        .map(([name, usages]) => ({ name, count: usages.length, usages }))
        .sort((a, b) => b.count - a.count),
      used: Object.entries(analysis.cljs.used)
        .map(([name, usages]) => ({ name, count: usages.length, usages }))
        .sort((a, b) => b.count - a.count)
    }
  };
  
  analysis.stats.totalComponents = 
    analysis.frequency.tsxJsx.defined.length + 
    analysis.frequency.cljs.defined.length;
  
  // Write output
  const outPath = join(ROOT, 'tools', 'ui-audit', 'component-frequency.json');
  writeFileSync(outPath, JSON.stringify(analysis, null, 2));
  
  console.error('\n=== Analysis Summary ===');
  console.error(`Files analyzed: ${analysis.stats.filesAnalyzed}`);
  console.error(`Parse errors: ${analysis.stats.parseErrors}`);
  console.error(`Total components found: ${analysis.stats.totalComponents}`);
  
  console.error('\n=== Top 30 TSX/JSX Components Defined ===');
  for (const c of analysis.frequency.tsxJsx.defined.slice(0, 30)) {
    console.error(`  ${c.name}: ${c.count} files`);
  }
  
  console.error('\n=== Top 30 TSX/JSX Components Used ===');
  for (const c of analysis.frequency.tsxJsx.used.slice(0, 30)) {
    console.error(`  ${c.name}: ${c.count} usages`);
  }
  
  console.error('\n=== Top 30 CLJS Components Defined ===');
  for (const c of analysis.frequency.cljs.defined.slice(0, 30)) {
    console.error(`  ${c.name}: ${c.count} files`);
  }
  
  console.error('\n=== Top 30 CLJS Hiccup Keywords Used ===');
  for (const c of analysis.frequency.cljs.used.slice(0, 30)) {
    console.error(`  ${c.name}: ${c.count} usages`);
  }
  
  console.error(`\nOutput written to: ${outPath}`);
  
  return analysis;
}

analyze();
