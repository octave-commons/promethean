import { readFile, writeFile, mkdir } from 'node:fs/promises';
import * as path from 'node:path';
export const makeLogPath = (config) => path.join(config.cachePath || 'docs/agile/boards/.cache', 'event-log.jsonl');
export const ensureLogDirectory = async (logPath) => {
    const dir = path.dirname(logPath);
    try {
        await mkdir(dir, { recursive: true });
    }
    catch (error) {
        // Directory already exists or creation failed
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
};
export const readEventLog = async (logPath) => {
    try {
        const content = await readFile(logPath, 'utf8');
        const lines = content
            .trim()
            .split('\n')
            .filter((line) => line.length > 0);
        return lines.map((line) => JSON.parse(line));
    }
    catch {
        return [];
    }
};
export const writeEvent = async (logPath, event) => {
    const eventLine = JSON.stringify(event) + '\n';
    await writeFile(logPath, eventLine, { flag: 'a' });
};
export const clearLog = async (logPath) => {
    await ensureLogDirectory(logPath);
    await writeFile(logPath, '');
};
//# sourceMappingURL=file-operations.js.map