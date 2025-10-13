import { normalizeExts, parseList, resolveWithBase, } from "./shared.js";
const mergePathSetting = (params) => {
    const fromEnv = typeof params.envValue === "string"
        ? resolveWithBase(params.context.repo, params.envValue)
        : params.defaults;
    const fromConfig = typeof params.configValue === "string"
        ? resolveWithBase(params.context.configDir, params.configValue)
        : fromEnv;
    return typeof params.argValue === "string"
        ? resolveWithBase(params.context.cwd, params.argValue)
        : fromConfig;
};
const resolveConfigArray = (current, override) => {
    if (Array.isArray(override)) {
        const normalized = override
            .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
            .filter((entry) => entry.length > 0);
        return normalized.length > 0 ? normalized : current;
    }
    if (typeof override === "string") {
        const normalized = parseList(override);
        return normalized.length > 0 ? normalized : current;
    }
    return current;
};
const mergeArraySetting = ({ defaults, envValue, configValue, argValue, }) => {
    const fromEnv = resolveConfigArray(defaults, envValue);
    const fromConfig = resolveConfigArray(fromEnv, configValue);
    return resolveConfigArray(fromConfig, argValue);
};
const buildPaths = ({ defaults, repo, cwd, envValues, argValues, fileConfig, configDir, }) => {
    const context = {
        repo,
        configDir,
        cwd,
    };
    const tasksDir = mergePathSetting({
        defaults: defaults.tasksDir,
        envValue: envValues.tasksDir,
        configValue: fileConfig.tasksDir,
        argValue: argValues.tasksDir,
        context,
    });
    const indexFile = mergePathSetting({
        defaults: defaults.indexFile,
        envValue: envValues.indexFile,
        configValue: fileConfig.indexFile,
        argValue: argValues.indexFile,
        context,
    });
    const boardFile = mergePathSetting({
        defaults: defaults.boardFile,
        envValue: envValues.boardFile,
        configValue: fileConfig.boardFile,
        argValue: argValues.boardFile,
        context,
    });
    const cachePath = mergePathSetting({
        defaults: defaults.cachePath,
        envValue: envValues.cachePath,
        configValue: fileConfig.cachePath,
        argValue: argValues.cachePath,
        context,
    });
    return { tasksDir, indexFile, boardFile, cachePath };
};
const buildArrays = ({ defaults, envValues, argValues, fileConfig, }) => {
    const exts = normalizeExts(mergeArraySetting({
        defaults: defaults.exts,
        envValue: envValues.exts,
        configValue: fileConfig.exts,
        argValue: argValues.exts,
    }));
    const requiredFields = mergeArraySetting({
        defaults: defaults.requiredFields,
        envValue: envValues.requiredFields,
        configValue: fileConfig.requiredFields,
        argValue: argValues.requiredFields,
    });
    const statusValues = mergeArraySetting({
        defaults: defaults.statusValues,
        envValue: envValues.statusValues,
        configValue: fileConfig.statusValues,
        argValue: argValues.statusValues,
    });
    const priorityValues = mergeArraySetting({
        defaults: defaults.priorityValues,
        envValue: envValues.priorityValues,
        configValue: fileConfig.priorityValues,
        argValue: argValues.priorityValues,
    });
    return {
        exts,
        requiredFields,
        statusValues,
        priorityValues,
    };
};
const mergeWipLimits = (defaults, configValue) => {
    return Object.freeze({ ...defaults, ...configValue });
};
export const mergeConfig = (inputs) => {
    const paths = buildPaths(inputs);
    const arrays = buildArrays(inputs);
    const wipLimits = mergeWipLimits(inputs.defaults.wipLimits, inputs.fileConfig.wipLimits);
    return Object.freeze({
        repo: inputs.repo,
        tasksDir: paths.tasksDir,
        indexFile: paths.indexFile,
        boardFile: paths.boardFile,
        cachePath: paths.cachePath,
        exts: Object.freeze(new Set(arrays.exts)),
        requiredFields: Object.freeze([...arrays.requiredFields]),
        statusValues: Object.freeze(new Set(arrays.statusValues)),
        priorityValues: Object.freeze(new Set(arrays.priorityValues)),
        wipLimits,
    });
};
