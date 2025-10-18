import { processTextTemplate, processMarkdownTemplate, validateTemplate } from './dist/index.js';

console.log('=== Testing Template Processor ===');

// Test 1: Basic variable substitution
console.log('\n1. Basic variable substitution:');
const result1 = processTextTemplate('Hello {{name}}!', { name: 'World' });
console.log('Template: Hello {{name}}!');
console.log('Result:', result1.processed);
console.log('Variables used:', result1.variablesUsed);
console.log('Errors:', result1.errors);

// Test 2: Conditional blocks
console.log('\n2. Conditional blocks:');
const result2 = processTextTemplate('{{#if show}}Visible content{{/if}}', { show: true });
console.log('Template: {{#if show}}Visible content{{/if}}');
console.log('Result:', result2.processed);
console.log('Variables used:', result2.variablesUsed);

// Test 3: Loop blocks
console.log('\n3. Loop blocks:');
const result3 = processTextTemplate('{{#each items}}- {{.}} {{/each}}', { items: ['apple', 'banana'] });
console.log('Template: {{#each items}}- {{.}} {{/each}}');
console.log('Result:', result3.processed);
console.log('Variables used:', result3.variablesUsed);

// Test 4: Markdown template
console.log('\n4. Markdown template:');
const result4 = processMarkdownTemplate('# {{title}}\n\nWelcome to {{site}}!', {
    title: 'Welcome',
    site: 'Promethean',
});
console.log('Template: # {{title}}\\n\\nWelcome to {{site}}!');
console.log('Result:', result4.processed);
console.log('Variables used:', result4.variablesUsed);

// Test 5: Validation
console.log('\n5. Template validation:');
const validation = validateTemplate('{{#if show}}Visible{{/if}}');
console.log('Template: {{#if show}}Visible{{/if}}');
console.log('Valid:', validation.isValid);
console.log('Errors:', validation.errors);
console.log('Warnings:', validation.warnings);

console.log('\n=== Template Processor Test Complete ===');
