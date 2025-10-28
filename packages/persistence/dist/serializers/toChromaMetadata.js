const normaliseValue = (value) => {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return JSON.stringify(value);
};
export const toChromaMetadata = (metadata) => {
    const result = {};
    for (const [key, value] of Object.entries(metadata)) {
        result[key] = normaliseValue(value);
    }
    return result;
};
//# sourceMappingURL=toChromaMetadata.js.map