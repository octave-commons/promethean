import path from "node:path";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, } from "node:fs/promises";
import { tmpdir } from "node:os";
export const makeTask = (overrides) => ({
    priority: "P3",
    labels: ["kanban"],
    created_at: "2025-09-01T00:00:00.000Z",
    estimates: {},
    content: "",
    slug: undefined,
    ...overrides,
});
export const makeBoard = (columns) => ({ columns });
export const withTempDir = async (t) => {
    const dir = await mkdtemp(path.join(tmpdir(), "kanban-test-"));
    t.teardown(async () => {
        await rm(dir, { recursive: true, force: true });
    });
    return dir;
};
export const writeTaskFile = async (dir, task, extra) => {
    await mkdir(dir, { recursive: true });
    const body = extra?.content ?? task.content ?? "Details";
    const labels = extra?.labels ?? task.labels ?? [];
    const labelsLine = `labels:${labels.length === 0
        ? " []"
        : ` [${labels.map((label) => JSON.stringify(label)).join(", ")}]`}`;
    const titleValue = task.title ?? "";
    const frontmatter = `---\nuuid: ${task.uuid}\ntitle: ${JSON.stringify(titleValue)}\nstatus: ${task.status}\npriority: ${task.priority ?? ""}\n${labelsLine}\ncreated_at: ${task.created_at ?? "2025-09-01T00:00:00.000Z"}\n---\n\n${body}\n`;
    const fileNameBase = task.slug ?? task.title ?? "task";
    const fileName = fileNameBase.trim().length > 0 ? fileNameBase : "task";
    const filePath = path.join(dir, `${fileName}.md`);
    await writeFile(filePath, frontmatter, "utf8");
    return filePath;
};
export const getTaskFileByUuid = async (dir, uuid) => {
    const files = await readdir(dir).catch(() => []);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const content = await readFile(fullPath, "utf8");
        if (content.includes(`uuid: "${uuid}"`)) {
            return { file, content };
        }
    }
    return undefined;
};
export const snapshotTaskFiles = async (dir) => {
    const snapshot = new Map();
    const files = await readdir(dir).catch(() => []);
    for (const file of files) {
        const full = path.join(dir, file);
        const text = await readFile(full, "utf8");
        snapshot.set(file, text);
    }
    return snapshot;
};
