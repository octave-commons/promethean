import { ollamaJSON } from '@promethean/utils';

async function testModelDetailed(model: string) {
  console.log(`\n🧪 Testing model: ${model}`);

  const prompt = `You are a TypeScript refactoring agent.

Return ONLY JSON with keys:
- title (string)
- rationale (string)
- EITHER "snippet_b64" (base64-encoded UTF-8 of an ESM JS file exporting: "export async function apply(project){...}")
- OR "dsl" (array of operations). Example op: {"op":"ensureExported","file":"src.ts","symbol":"helper","kind":"function"}

Rules:
- Do NOT include backticks or markdown fences anywhere.
- If you provide "snippet_b64", the JS must import nothing except what's available in ts-morph Project and standard runtime.
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

    if ((result as any).snippet_b64) {
      const decoded = Buffer.from((result as any).snippet_b64, 'base64').toString('utf8');
      console.log('📝 Decoded snippet:', decoded);
    }

    if ((result as any).dsl) {
      console.log('🔧 DSL operations:', JSON.stringify((result as any).dsl, null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', (error as any).message);
  }
}

async function main() {
  await testModelDetailed('qwen3:4b');
}

main().catch(console.error);