export const toEpochMilliseconds = (timestamp) => {
    if (timestamp instanceof Date)
        return timestamp.getTime();
    if (typeof timestamp === 'string')
        return new Date(timestamp).getTime();
    if (typeof timestamp === 'number')
        return timestamp;
    return Date.now();
};
