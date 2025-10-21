import test from 'ava';
import { Project, Node } from 'ts-morph';
import { Op, PlanSchema, dslToSnippet, decodeB64 } from '../iter/dsl.js';

function parseCodeToAST(code: string) {
  const project = new Project();
  const sourceFile = project.createSourceFile('temp.ts', code);
  return sourceFile;
}

function getASTStructure(node: Node): any {
  const structure: any = {
    kind: node.getKindName(),
  };

  if (node.getText()) {
    structure.text = node.getText();
  }

  const children = node.getChildren();
  if (children.length > 0) {
    structure.children = children.map(getASTStructure);
  }

  return structure;
}

test('Op schema validation', (t) => {
  const ensureExportedOp = {
    op: 'ensureExported',
    file: 'src/test.ts',
    symbol: 'testFunction',
    kind: 'function',
  };

  const result = Op.safeParse(ensureExportedOp);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.op, 'ensureExported');
    t.is(result.data.file, 'src/test.ts');
    if (result.data.op === 'ensureExported') {
      t.is(result.data.symbol, 'testFunction');
      t.is(result.data.kind, 'function');
    }
  }
});

test('renameSymbol operation validation', (t) => {
  const renameOp = {
    op: 'renameSymbol',
    file: 'src/test.ts',
    from: 'oldName',
    to: 'newName',
  };

  const result = Op.safeParse(renameOp);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.op, 'renameSymbol');
    if (result.data.op === 'renameSymbol') {
      t.is(result.data.from, 'oldName');
      t.is(result.data.to, 'newName');
    }
  }
});

test('makeParamOptional operation validation', (t) => {
  const paramOp = {
    op: 'makeParamOptional',
    file: 'src/test.ts',
    fn: 'testFunction',
    param: 'optionalParam',
  };

  const result = Op.safeParse(paramOp);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.op, 'makeParamOptional');
    if (result.data.op === 'makeParamOptional') {
      t.is(result.data.fn, 'testFunction');
      t.is(result.data.param, 'optionalParam');
    }
  }
});

test('addImport operation validation', (t) => {
  const importOp = {
    op: 'addImport',
    file: 'src/test.ts',
    from: 'lodash',
    names: ['map', 'filter'],
  };

  const result = Op.safeParse(importOp);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.op, 'addImport');
    if (result.data.op === 'addImport') {
      t.is(result.data.from, 'lodash');
      t.deepEqual(result.data.names, ['map', 'filter']);
    }
  }
});

test('addTypeAnnotation operation validation', (t) => {
  const typeOp = {
    op: 'addTypeAnnotation',
    file: 'src/test.ts',
    selector: 'function:testFunction',
    typeText: 'string',
  };

  const result = Op.safeParse(typeOp);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.op, 'addTypeAnnotation');
    if (result.data.op === 'addTypeAnnotation') {
      t.is(result.data.selector, 'function:testFunction');
      t.is(result.data.typeText, 'string');
    }
  }
});

test('insertStubFunction operation validation', (t) => {
  const stubOp = {
    op: 'insertStubFunction',
    file: 'src/test.ts',
    name: 'newFunction',
    signature: '(param: string): number',
    returns: '42',
  };

  const result = Op.safeParse(stubOp);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.op, 'insertStubFunction');
    if (result.data.op === 'insertStubFunction') {
      t.is(result.data.name, 'newFunction');
      t.is(result.data.signature, '(param: string): number');
      t.is(result.data.returns, '42');
    }
  }
});

test('Plan schema validation', (t) => {
  const plan = {
    title: 'Fix missing export',
    rationale: 'The function needs to be exported for external use',
    dsl: [
      {
        op: 'ensureExported',
        file: 'src/test.ts',
        symbol: 'testFunction',
        kind: 'function',
      },
    ],
  };

  const result = PlanSchema.safeParse(plan);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.title, 'Fix missing export');
    t.is(result.data.rationale, 'The function needs to be exported for external use');
    t.is(result.data.dsl?.length, 1);
    if (result.data.dsl && result.data.dsl.length > 0) {
      const firstOp = result.data.dsl[0];
      if (firstOp) {
        t.is(firstOp.op, 'ensureExported');
      }
    }
  }
});

test('decodeB64 function', (t) => {
  const original = 'export function test() { return "hello"; }';
  const encoded = Buffer.from(original).toString('base64');
  const decoded = decodeB64(encoded);

  t.is(decoded, original);
});

test('dslToSnippet generates valid JavaScript', async (t) => {
  const ops = [
    {
      op: 'ensureExported' as const,
      file: 'src/test.ts',
      symbol: 'testFunction',
      kind: 'function' as const,
    },
    {
      op: 'addImport' as const,
      file: 'src/test.ts',
      from: 'lodash',
      names: ['map'],
    },
  ];

  const snippet = await dslToSnippet(ops);

  // Test that the code is syntactically valid by parsing it
  const ast = parseCodeToAST(snippet);
  t.truthy(ast);

  // Test AST structure contains expected patterns
  const astStructure = getASTStructure(ast);
  const astString = JSON.stringify(astStructure, null, 2);

  // Check for import statement
  t.true(astString.includes('ImportDeclaration'), 'Should contain import declaration');

  // Check for export function (it's an ExportKeyword, not ExportDeclaration)
  t.true(astString.includes('ExportKeyword'), 'Should contain export keyword');
  t.true(astString.includes('FunctionDeclaration'), 'Should contain function declaration');

  // Check for specific function calls in the generated code
  t.true(astString.includes('CallExpression'), 'Should contain function calls');
  t.true(astString.includes('setIsExported'), 'Should contain setIsExported call');
  t.true(astString.includes('addImportDeclaration'), 'Should contain addImportDeclaration call');
});

test('dslToSnippet handles empty operations', async (t) => {
  const snippet = await dslToSnippet([]);

  t.true(snippet.includes('import { SyntaxKind } from "ts-morph"'));
  t.true(snippet.includes('export async function apply(project)'));
  t.true(snippet.includes('}'));
});
