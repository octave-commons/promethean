#!/usr/bin/env node

import { ollamaJSON } from '@promethean/utils';

async function debugModel(model) {
  console.log(`\n🔍 Testing model: ${model}`);
  console.log('='.repeat(50));

  const testPrompt = `You are a TypeScript refactoring agent.

Return ONLY JSON with keys:
- title (string)
- rationale (string)
- "dsl" (array of operations)

Available operations with EXACT field names:
- ensureExported: {"op":"ensureExported","file":"path/to/file.ts","symbol":"functionName","kind":"function"}

Rules:
- Do NOT include backticks or markdown fences anywhere.
- Use DSL operations for all fixes.
- Use EXACT field names as shown above.

Target error:
FILE: /test/src.ts
LINE: 1, COL: 1
CODE: TS2304
MESSAGE: Cannot find name 'undefinedVar'.

Code frame:
undefinedVar;

Previous attempts:
(none)`;

  try {
    const result = await ollamaJSON(model, testPrompt);
    console.log('✅ Success - Parsed JSON:');
    console.log(JSON.stringify(result, null, 2));

    // Check if it has required fields
    if (!result.title) console.log('❌ Missing "title" field');
    if (!result.rationale) console.log('❌ Missing "rationale" field');
    if (!result.dsl || !Array.isArray(result.dsl)) console.log('❌ Missing or invalid "dsl" field');
  } catch (error) {
    console.log('❌ Failed to parse JSON:');
    console.log(error.message);
  }
}

async function main() {
  const models = ['qwen3:8b', 'qwen3:14b', 'qwen2.5-coder:7b'];

  for (const model of models) {
    await debugModel(model);
  }
}

main().catch(console.error);
