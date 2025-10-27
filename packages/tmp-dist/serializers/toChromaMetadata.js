export const toChromaMetadata = (metadata) => {
    const result = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (value !== null && value !== undefined) {
            result[key] = value;
        }
    }
    return result;
};
