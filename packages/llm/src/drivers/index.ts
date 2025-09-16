import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

import { load as yamlLoad } from 'js-yaml';

import { LLMDriver } from './base.js';
import { OllamaDriver } from './ollama.js';
import { HuggingFaceDriver } from './huggingface.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readConfig(): Record<string, unknown> {
    const candidates = [
        path.resolve(process.cwd(), 'config/config.yml'),
        path.resolve(__dirname, '../../../../config/config.yml'),
    ];
    const found = candidates.find((p) => fs.existsSync(p));
    if (found) {
        const data = (yamlLoad as (input: string) => unknown)(fs.readFileSync(found, 'utf8')) as {
            llm?: Record<string, unknown>;
        };
        return data.llm ?? {};
    }
    return {};
}

export async function loadDriver(): Promise<LLMDriver> {
    const cfg = readConfig();
    const name = (process.env.LLM_DRIVER || cfg.driver || 'ollama') as string;
    const model = (process.env.LLM_MODEL || cfg.model || 'gemma3:latest') as string;
    const driver: LLMDriver = name === 'huggingface' ? new HuggingFaceDriver() : new OllamaDriver();
    await driver.load(model);
    return driver;
}

export type { LLMDriver } from './base.js';
