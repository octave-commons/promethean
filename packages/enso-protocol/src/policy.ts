export const retention = {
  messages: { defaultTTL: 7 * 24 * 3600, maxTTL: 90 * 24 * 3600 },
  assets: {
    defaultTTL: 30 * 24 * 3600,
    maxTTL: 180 * 24 * 3600,
    allowDerivations: true,
  },
  logs: { keepProtocolLogs: true, logTTL: 7 * 24 * 3600 },
  roster: { keepPresenceHistory: false },
  index: { allowSearch: true, indexTTL: 30 * 24 * 3600 },
};
export const cachePolicy = {
  maxBytesPerRoom: 5 * 1024 ** 3,
  maxBytesPerEntry: 256 * 1024 ** 2,
  defaultTTLSeconds: 30 * 24 * 3600,
  pinTags: ["index:*"],
  privateTags: ["session:*"],
};
