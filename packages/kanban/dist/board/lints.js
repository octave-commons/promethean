import { readFile } from "node:fs/promises";
import path from "node:path";
import { listFilesRec } from "@promethean-os/utils/list-files-rec.js";
import { parseFrontmatter } from "@promethean-os/markdown/frontmatter";
import { loadKanbanConfig } from "./config.js";
const EMPTY_ERRORS = Object.freeze([]);
const toTrimmedString = (value, fallback = "") => {
    if (typeof value !== "string")
        return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
};
const toOptionalString = (value) => {
    const trimmed = toTrimmedString(value);
    return trimmed.length > 0 ? trimmed : undefined;
};
const toLabelArray = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((entry) => toTrimmedString(entry))
            .filter((entry) => entry.length > 0);
    }
    if (typeof value === "string") {
        return value
            .split(",")
            .map((entry) => toTrimmedString(entry))
            .filter((entry) => entry.length > 0);
    }
    return [];
};
const toTaskFM = (data) => {
    const rawId = data.id ??
        data.uuid;
    const rawCreated = data.created ??
        data.created_at;
    const fm = {
        id: toTrimmedString(rawId),
        title: toTrimmedString(data.title),
        status: toTrimmedString(data.status),
        priority: toTrimmedString(data.priority),
        owner: toTrimmedString(data.owner),
        labels: toLabelArray(data.labels),
        created: toTrimmedString(rawCreated),
        updated: toOptionalString(data.updated),
        uuid: toOptionalString(data.uuid),
        created_at: toOptionalString(data.created_at),
    };
    return Object.freeze(fm);
};
const filenameErrors = (task, fmData, filePath) => {
    const baseName = path.basename(filePath, ".md");
    const hasExplicitId = typeof fmData.id === "string" && fmData.id.length > 0;
    if (!hasExplicitId || task.id.length === 0) {
        return EMPTY_ERRORS;
    }
    return baseName.startsWith(task.id)
        ? EMPTY_ERRORS
        : Object.freeze([
            `${path.basename(filePath)}: filename should start with id '${task.id}'`,
        ]);
};
const requiredFieldErrors = (task, fmData, filePath, requiredFields) => Object.freeze(requiredFields
    .map((field) => {
    if (field === "labels") {
        return task.labels.length > 0
            ? undefined
            : `${path.basename(filePath)}: missing required field '${field}'`;
    }
    const value = fmData[field];
    return typeof value === "string" && value.length > 0
        ? undefined
        : `${path.basename(filePath)}: missing required field '${field}'`;
})
    .filter((message) => Boolean(message)));
const enumErrors = (task, filePath, { statusValues, priorityValues, }) => Object.freeze([
    statusValues.has(task.status)
        ? undefined
        : `${path.basename(filePath)}: invalid status '${task.status}'`,
    priorityValues.has(task.priority)
        ? undefined
        : `${path.basename(filePath)}: invalid priority '${task.priority}'`,
].filter((message) => Boolean(message)));
const lintTaskFile = async (filePath, { requiredFields, statusValues, priorityValues, }) => readFile(filePath, "utf8")
    .then((raw) => parseFrontmatter(raw))
    .then(({ data }) => ({ task: toTaskFM(data ?? {}), fm: data ?? {} }))
    .then(({ task, fm }) => Object.freeze([
    ...filenameErrors(task, fm, filePath),
    ...requiredFieldErrors(task, fm, filePath, requiredFields),
    ...enumErrors(task, filePath, { statusValues, priorityValues }),
]))
    .catch((error) => Object.freeze([
    `${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`,
]));
const main = async () => {
    const { config } = await loadKanbanConfig();
    const files = await listFilesRec(config.tasksDir, new Set(config.exts));
    const errors = (await Promise.all(files.map((filePath) => lintTaskFile(filePath, {
        requiredFields: config.requiredFields,
        statusValues: config.statusValues,
        priorityValues: config.priorityValues,
    })))).flat();
    if (errors.length > 0) {
        errors.forEach((message) => {
            console.error(message);
        });
        process.exit(1);
    }
    console.log(`Lint OK: ${files.length} task file(s)`);
};
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=lints.js.map