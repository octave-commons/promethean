import fs from 'node:fs/promises';
import { globby } from 'globby';
import { parseFrontmatter, stringifyFrontmatter, normalizeStringList } from '@promethean-os/markdown/frontmatter';
const TASK_GLOBS = [
    'docs/agile/tasks/**/*.md',
    'docs/inbox/**/*.md',
];
const sanitizeOnce = (raw) => {
    // Only minimal, known-bad token cleanup from previous migration attempts.
    return raw
        .replace(/string\[\];?/g, '')
        .replace(/;\s*,/g, ', ')
        .replace(/\|\]/g, ']')
        .replace(/,\s*tags\]/gi, ']')
        .replace(/tags,\s*tags/gi, 'tags')
        // Remove inline backticks in title
        .replace(/^title:\s*`([^`]+)`(.*)$/m, 'title: $1$2')
        // Quote titles containing unicode dashes if unquoted
        .replace(/^title:\s*([^'"].*—.*)$/m, "title: '$1'")
        // Merge split tag arrays on one line
        .replace(/^(tags:\s*\[[^\]]+?)\],\s*\[([^\]]+\])/m, '$1, $2');
};
const coerceStringArray = (val) => {
    if (!val)
        return [];
    if (Array.isArray(val))
        return normalizeStringList(val).map(String);
    if (typeof val === 'string') {
        // common cases: comma/space separated
        const parts = val.split(/[\n,]/g).flatMap(s => s.split(/\s+/g));
        return normalizeStringList(parts);
    }
    return [];
};
const normalizeTag = (t) => t.replace(/^#/, '').trim().toLowerCase();
const mergeTags = (fm) => {
    const rawTags = coerceStringArray(fm.tags);
    const rawLabels = coerceStringArray(fm.labels);
    const merged = Array.from(new Set([...rawTags, ...rawLabels].map(normalizeTag))).filter(Boolean);
    return merged;
};
async function processFile(file) {
    const original = await fs.readFile(file, 'utf8');
    const tryParse = (txt) => {
        try {
            return parseFrontmatter(txt);
        }
        catch (_err) {
            return null;
        }
    };
    let parsed = tryParse(original);
    let usedSanitized = false;
    if (!parsed) {
        const sanitized = sanitizeOnce(original);
        parsed = tryParse(sanitized);
        if (!parsed) {
            console.error(`Failed to parse frontmatter for ${file} (even after sanitizeOnce)`);
            return 'skipped';
        }
        usedSanitized = true;
    }
    const before = parsed.data ?? {};
    const after = { ...before };
    const tags = mergeTags(before);
    // If nothing to do for tags/labels, we may still need to write back
    // sanitized frontmatter if we had to sanitize to parse.
    if (("labels" in before && coerceStringArray(before.labels).length === 0) && tags.length === 0) {
        if (usedSanitized) {
            const nextSanitized = stringifyFrontmatter(parsed.content, before);
            if (nextSanitized !== original) {
                await fs.writeFile(file, nextSanitized, 'utf8');
                return 'updated';
            }
        }
        return 'skipped';
    }
    // Write normalized tags and drop labels
    after.tags = tags;
    if ('labels' in after)
        delete after.labels;
    // Only write when effective change
    const sameTags = JSON.stringify(coerceStringArray(before.tags).map(normalizeTag)) === JSON.stringify(tags);
    const hadLabels = 'labels' in before;
    if (sameTags && !hadLabels && !usedSanitized) {
        return 'skipped';
    }
    const next = stringifyFrontmatter(parsed.content, after);
    await fs.writeFile(file, next, 'utf8');
    return 'updated';
}
async function main() {
    const cwd = process.cwd();
    const files = await globby(TASK_GLOBS, { cwd, absolute: true, gitignore: true });
    let updated = 0;
    let skipped = 0;
    for (const file of files) {
        const res = await processFile(file);
        if (res === 'updated')
            updated++;
        else
            skipped++;
    }
    console.log(`migrate-labels-to-tags ✔ updated ${updated} files; skipped ${skipped}`);
}
main().catch((_err) => {
    console.error('migrate-labels-to-tags ❌ failed:', _err);
    process.exitCode = 1;
});
//# sourceMappingURL=migrate-labels-to-tags.js.map