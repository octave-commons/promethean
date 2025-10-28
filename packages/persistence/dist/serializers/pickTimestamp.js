export const pickTimestamp = (...candidates) => {
    for (const candidate of candidates) {
        if (candidate instanceof Date || typeof candidate === 'number' || typeof candidate === 'string') {
            return candidate;
        }
    }
    return undefined;
};
//# sourceMappingURL=pickTimestamp.js.map