import test from 'ava';
import { processMarkdownTemplate, processTextTemplate, validateTemplate, type TemplateContext } from '../template.js';

test('processTextTemplate - basic variable substitution', (t) => {
    const template = 'Hello {{name}}! Welcome to {{place}}.';
    const context: TemplateContext = {
        name: 'World',
        place: 'Promethean',
    };

    const result = processTextTemplate(template, context);

    t.is(result.processed, 'Hello World! Welcome to Promethean.');
    t.deepEqual([...result.variablesUsed].sort(), ['name', 'place']);
    t.is(result.errors.length, 0);
    t.is(result.warnings.length, 0);
});

test('processTextTemplate - missing variable in strict mode', (t) => {
    const template = 'Hello {{name}}!';
    const context: TemplateContext = {};

    const result = processTextTemplate(template, context, { strictMode: true });

    t.is(result.processed, 'Hello {{name}}!');
    t.deepEqual([...result.variablesUsed], ['name']);
    t.is(result.errors.length, 1);
    t.true(result.errors[0]!.includes('Undefined variable: name'));
});

test('processTextTemplate - conditional blocks', (t) => {
    const template = '{{#if show}}Visible content{{/if}}';
    const context: TemplateContext = { show: true };

    const result = processTextTemplate(template, context);

    t.is(result.processed, 'Visible content');
    t.deepEqual(result.variablesUsed, ['show']);
    t.is(result.errors.length, 0);
});

test('processTextTemplate - conditional blocks - false condition', (t) => {
    const template = '{{#if show}}Visible content{{/if}}';
    const context: TemplateContext = { show: false };

    const result = processTextTemplate(template, context);

    t.is(result.processed, '');
    t.deepEqual(result.variablesUsed, ['show']);
    t.is(result.errors.length, 0);
});

test('processTextTemplate - loop blocks with array', (t) => {
    const template = '{{#each items}}- {{.}} {{/each}}';
    const context: TemplateContext = {
        items: ['apple', 'banana', 'cherry'],
    };

    const result = processTextTemplate(template, context);

    t.is(result.processed, '- apple - banana - cherry ');
    t.deepEqual(result.variablesUsed, ['items']);
    t.is(result.errors.length, 0);
});

test('processTextTemplate - loop blocks with objects', (t) => {
    const template = '{{#each users}}{{name}}: {{age}} {{/each}}';
    const context: TemplateContext = {
        users: [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
        ],
    };

    const result = processTextTemplate(template, context);

    t.is(result.processed, ':  :  ');
    t.deepEqual(result.variablesUsed, ['users']);
    t.is(result.errors.length, 0);
});

test('processTextTemplate - nested object access', (t) => {
    const template = 'User: {{user.name}}, Age: {{user.age}}';
    const context: TemplateContext = {
        user: {
            name: 'John',
            age: 25,
        },
    };

    const result = processTextTemplate(template, context);

    t.is(result.processed, 'User: John, Age: 25');
    t.deepEqual([...result.variablesUsed].sort(), ['user.age', 'user.name']);
    t.is(result.errors.length, 0);
});

test('processMarkdownTemplate - basic markdown with variables', (t) => {
    const template = '# {{title}}\n\nWelcome to {{site}}!';
    const context: TemplateContext = {
        title: 'Welcome',
        site: 'Promethean',
    };

    const result = processMarkdownTemplate(template, context);

    t.is(result.processed, '# Welcome\n\nWelcome to Promethean!');
    t.deepEqual([...result.variablesUsed].sort(), ['site', 'title']);
    t.is(result.errors.length, 0);
});

test('processMarkdownTemplate - markdown with code blocks', (t) => {
    const template = '```javascript\nconst {{variable}} = "{{value}}";\n```';
    const context: TemplateContext = {
        variable: 'name',
        value: 'test',
    };

    const result = processMarkdownTemplate(template, context);

    t.true(result.processed.includes('const name = "test";'));
    t.deepEqual([...result.variablesUsed].sort(), ['value', 'variable']);
    t.is(result.errors.length, 0);
});

test('validateTemplate - valid template', (t) => {
    const template = 'Hello {{name}}! {{#if show}}Visible{{/if}}';

    const result = validateTemplate(template);

    t.true(result.isValid);
    t.is(result.errors.length, 0);
});

test('validateTemplate - mismatched conditionals', (t) => {
    const template = '{{#if show}}Visible{{#if other}}Also visible{{/if}}';

    const result = validateTemplate(template);

    t.false(result.isValid);
    t.true(result.errors.length > 0);
    t.true(result.errors[0]!.includes('Mismatched conditional tags'));
});

test('validateTemplate - mismatched loops', (t) => {
    const template = '{{#each items}}Item{{#each}}';

    const result = validateTemplate(template);

    t.false(result.isValid);
    t.true(result.errors.length > 0);
    t.true(result.errors[0]!.includes('Mismatched loop tags'));
});

test('validateTemplate - nested patterns warning', (t) => {
    const template = '{{#if outer}}{{#if inner}}Nested{{/if}}{{/if}}';

    const result = validateTemplate(template);

    t.true(result.isValid);
    t.true(result.warnings.length > 0);
    t.true(result.warnings[0]!.includes('Nested conditionals or loops detected'));
});

test('processTextTemplate - custom patterns', (t) => {
    const template = 'Hello ${name}! <% if show %>Visible<% /if %>';
    const context: TemplateContext = {
        name: 'World',
        show: true,
    };

    const result = processTextTemplate(template, context, {
        variablePattern: /\$\{(\w+(?:\.\w+)*)\}/g,
        conditionalPattern: /<% if (\w+) %>(.*?)<% \/if %>/gs,
    });

    t.is(result.processed, 'Hello World! Visible');
    t.deepEqual([...result.variablesUsed].sort(), ['name', 'show']);
    t.is(result.errors.length, 0);
});

test('processTextTemplate - complex nested context', (t) => {
    const template = 'User: {{user.profile.name}} ({{user.profile.age}})';
    const context: TemplateContext = {
        user: {
            profile: {
                name: 'Alice',
                age: 30,
            },
        },
    };

    const result = processTextTemplate(template, context);

    t.is(result.processed, 'User: Alice (30)');
    t.deepEqual([...result.variablesUsed].sort(), ['user.profile.age', 'user.profile.name']);
    t.is(result.errors.length, 0);
});

test('processTextTemplate - boolean and number values', (t) => {
    const template = 'Count: {{count}}, Active: {{active}}, Score: {{score}}';
    const context: TemplateContext = {
        count: 42,
        active: true,
        score: 3.14,
    };

    const result = processTextTemplate(template, context);

    t.is(result.processed, 'Count: 42, Active: true, Score: 3.14');
    t.deepEqual([...result.variablesUsed].sort(), ['active', 'count', 'score']);
    t.is(result.errors.length, 0);
});

test('processTextTemplate - null and undefined values', (t) => {
    const template = 'Name: {{name}}, Email: {{email}}, Phone: {{phone}}';
    const context: TemplateContext = {
        name: 'John',
        email: null,
        phone: undefined,
    };

    const result = processTextTemplate(template, context);

    t.is(result.processed, 'Name: John, Email: , Phone: ');
    t.deepEqual([...result.variablesUsed].sort(), ['email', 'name', 'phone']);
    t.is(result.errors.length, 0);
});
