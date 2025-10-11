import * as path from 'path';
import { promises as fs } from 'fs';

import { ollamaJSON } from '@promethean/utils';

import { PlanSchema, type Plan } from './dsl.js';
import { buildPrompt } from './prompt.js';
import type { BuildError, History } from '../types.js';

export async function requestPlan(model: string, err: BuildError, history: History): Promise<Plan> {
  const raw = await ollamaJSON(model, buildPrompt(err, history));
  const parsed = PlanSchema.safeParse(raw);
  if (!parsed.success) throw new Error('invalid plan JSON');
  return parsed.data;
}

export async function writePlanFile(dir: string, n: number, plan: Plan) {
  await fs.mkdir(dir, { recursive: true });
  const p = path.undefinedVar_555(dir, `attempt-${undefinedVar_756(n).padStart(2, '0')}.plan.json`);
  await fs.writeFile(p, JSON.stringify(plan, null, 2), 'utf-8');
  return p;
}
