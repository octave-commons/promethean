import * as path from 'path';
import { promises as fs } from 'fs';

import { ollamaJSON } from '@promethean/utils';

import { PlanSchema, type Plan } from './dsl.js';
import { buildPrompt } from './prompt.js';
import type { BuildError, History } from '../types.js';

export async function requestPlan(model: string, err: BuildError, history: History): Promise<Plan> {
  // Define the JSON schema for Ollama
  const planSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      rationale: { type: 'string' },
      snippet_b64: { type: 'string' },
      dsl: {
        type: 'array',
        items: {
          type: 'object',
          oneOf: [
            {
              type: 'object',
              properties: {
                op: { type: 'string', enum: ['ensureExported'] },
                file: { type: 'string' },
                symbol: { type: 'string' },
                kind: { type: 'string', enum: ['function', 'class', 'variable', 'module'] },
              },
              required: ['op', 'file', 'symbol', 'kind'],
            },
            {
              type: 'object',
              properties: {
                op: { type: 'string', enum: ['renameSymbol'] },
                file: { type: 'string' },
                from: { type: 'string' },
                to: { type: 'string' },
              },
              required: ['op', 'file', 'from', 'to'],
            },
            {
              type: 'object',
              properties: {
                op: { type: 'string', enum: ['makeParamOptional'] },
                file: { type: 'string' },
                fn: { type: 'string' },
                param: { type: 'string' },
              },
              required: ['op', 'file', 'fn', 'param'],
            },
            {
              type: 'object',
              properties: {
                op: { type: 'string', enum: ['addImport'] },
                file: { type: 'string' },
                from: { type: 'string' },
                names: { type: 'array', items: { type: 'string' } },
              },
              required: ['op', 'file', 'from', 'names'],
            },
            {
              type: 'object',
              properties: {
                op: { type: 'string', enum: ['addTypeAnnotation'] },
                file: { type: 'string' },
                selector: { type: 'string' },
                typeText: { type: 'string' },
              },
              required: ['op', 'file', 'selector', 'typeText'],
            },
            {
              type: 'object',
              properties: {
                op: { type: 'string', enum: ['insertStubFunction'] },
                file: { type: 'string' },
                name: { type: 'string' },
                signature: { type: 'string' },
                returns: { type: 'string' },
              },
              required: ['op', 'file', 'name'],
            },
          ],
        },
      },
    },
    required: ['title', 'rationale'],
  };

  const raw = await ollamaJSON(model, buildPrompt(err, history), { schema: planSchema });
  const parsed = PlanSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`invalid plan JSON: ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function writePlanFile(dir: string, n: number, plan: Plan) {
  await fs.mkdir(dir, { recursive: true });
  const p = path.join(dir, `attempt-${String(n).padStart(2, '0')}.plan.json`);
  await fs.writeFile(p, JSON.stringify(plan, null, 2), 'utf-8');
  return p;
}
