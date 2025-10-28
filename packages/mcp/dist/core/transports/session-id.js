const toUuidString = (bytes) => {
    const hex = Buffer.from(bytes).toString("hex");
    const sections = [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ];
    return sections.join("-");
};
const fallbackGenerator = (randomBytes) => {
    return () => {
        const values = Array.from(randomBytes(16), (value, index) => {
            if (index === 6) {
                return ((value ?? 0) & 0x0f) | 0x40;
            }
            if (index === 8) {
                return ((value ?? 0) & 0x3f) | 0x80;
            }
            return value ?? 0;
        });
        return toUuidString(values);
    };
};
export const createSessionIdGenerator = (cryptoModule) => {
    const { randomUUID } = cryptoModule;
    if (typeof randomUUID === "function") {
        const generator = randomUUID.bind(cryptoModule);
        return () => generator();
    }
    return fallbackGenerator(cryptoModule.randomBytes.bind(cryptoModule));
};
//# sourceMappingURL=session-id.js.map