const BASE64_ENCODING = "base64";
const UTF8_ENCODING = "utf-8";
const whitespacePattern = /\s+/g;
const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const stripWhitespace = (value) => value.replace(whitespacePattern, "");
const normalizeBase64String = (value) => Buffer.from(value, "base64").toString("base64").replace(/=+$/, "");
const isValidBase64 = (value) => base64Pattern.test(value) &&
    normalizeBase64String(value) === value.replace(/=+$/, "");
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isGithubBase64Node = (value) => typeof value.encoding === "string" &&
    value.encoding.toLowerCase() === BASE64_ENCODING &&
    typeof value.content === "string";
const decodeBase64Content = (value) => {
    const normalized = stripWhitespace(value.content);
    if (!isValidBase64(normalized)) {
        return value;
    }
    const buffer = Buffer.from(normalized, "base64");
    return {
        ...value,
        encoding: UTF8_ENCODING,
        rawEncoding: value.encoding,
        rawContent: value.content,
        content: buffer.toString("utf8"),
    };
};
const transformNode = (value) => {
    if (Array.isArray(value)) {
        const items = value;
        return items.map((item) => transformNode(item));
    }
    if (isRecord(value)) {
        const entries = Object.entries(value);
        const transformedEntries = entries.map(([key, entry]) => [key, transformNode(entry)]);
        const transformed = Object.fromEntries(transformedEntries);
        if (isGithubBase64Node(transformed)) {
            return decodeBase64Content(transformed);
        }
        return transformed;
    }
    return value;
};
export const normalizeGithubPayload = (value) => transformNode(value);
export const isBase64String = (value) => isValidBase64(stripWhitespace(value));
//# sourceMappingURL=base64.js.map