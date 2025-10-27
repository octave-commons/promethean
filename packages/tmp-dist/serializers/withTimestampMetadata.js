export const withTimestampMetadata = (metadata, key, timestamp) => ({
    ...metadata,
    [key]: timestamp,
    timeStamp: timestamp,
});
