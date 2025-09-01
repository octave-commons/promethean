import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { LLMDriver } from './base.js';
import { OllamaDriver } from './ollama.js';
import { HuggingFaceDriver } from './huggingface.js';

function readConfig(): any {
    const candidates = [
        path.resolve(process.cwd(), 'config/config.yml'),
        path.resolve(__dirname, '../../../../config/config.yml'),
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            const data = yaml.load(fs.readFileSync(p, 'utf8')) as any;
            return data.llm || {};
        }
    }
    return {};
}

export async function loadDriver(): Promise<LLMDriver> {
    const cfg = readConfig();
    const name = process.env.LLM_DRIVER || cfg.driver || 'ollama';
    const model = process.env.LLM_MODEL || cfg.model || 'gemma3:latest';
    let driver: LLMDriver;
    switch (name) {
        case 'huggingface':
            driver = new HuggingFaceDriver();
            break;
        case 'ollama':
        default:
            driver = new OllamaDriver();
    }
    await driver.load(model);
    return driver;
}

export type { LLMDriver } from './base.js';
