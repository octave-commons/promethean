import { ollamaJSON } from '@promethean/utils';

async function testModelWithDSL(model: string) {
  console.log(`\n🧪 Testing model with DSL preference: ${model}`);

  const prompt = `You are a TypeScript refactoring agent.

Return ONLY JSON with keys:
- title (string)
- rationale (string)
- "dsl" (array of operations). Example op: {"op":"ensureExported","file":"src.ts","symbol":"helper","kind":"function"}

Available operations:
- ensureExported: Make a function/class/variable exported
- renameSymbol: Rename a function, class, or variable
- makeParamOptional: Make a function parameter optional
- addImport: Add an import statement
- addTypeAnnotation: Add type annotation to function or variable
- insertStubFunction: Insert a new function stub

Rules:
- Do NOT include backticks or markdown fences anywhere.
- Use DSL operations instead of code snippets.
- Prefer minimal, targeted edits.

Target error:
FILE: src.ts
LINE: 1, COL: 10
CODE: TS2459
MESSAGE: Module '"./src"' declares 'helper' locally, but it is not exported.

Code frame:
function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}

Previous attempts:
(none)`;

  try {
    const result = await ollamaJSON(model, prompt);
    console.log('✅ Raw result:', JSON.stringify(result, null, 2));

    if ((result as any).dsl) {
      console.log('🔧 DSL operations:', JSON.stringify((result as any).dsl, null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', (error as any).message);
  }
}

async function main() {
  const models = ['qwen3:4b', 'qwen2.5-coder:7b', 'llama3.1'];

  for (const model of models) {
    await testModelWithDSL(model);
  }
}

main().catch(console.error);
