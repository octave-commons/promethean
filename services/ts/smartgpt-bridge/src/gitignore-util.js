// Utility to load and merge .gitignore files from root to a given directory
import fs from 'fs/promises';
import path from 'path';
import ignore from 'ignore';

/**
 * Loads and merges all .gitignore files from ROOT_PATH down to targetDir.
 * Returns an ignore matcher instance.
 */
export async function loadGitIgnore(ROOT_PATH, targetDir) {
    const ig = ignore();
    let current = path.resolve(ROOT_PATH);
    const target = path.resolve(targetDir);
    const parts = target.replace(current, '').split(path.sep).filter(Boolean);
    for (let i = 0; i <= parts.length; ++i) {
        const dir = path.join(current, ...parts.slice(0, i));
        const giPath = path.join(dir, '.gitignore');
        try {
            const content = await fs.readFile(giPath, 'utf8');
            ig.add(content.split('\n'));
        } catch {}
    }
    return ig;
}
