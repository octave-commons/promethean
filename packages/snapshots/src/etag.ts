import { sha1 } from '@promethean/utils';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonArray | JsonObject;
type JsonArray = readonly JsonValue[];
type JsonObject = { readonly [key: string]: JsonValue };

const isJsonObject = (value: JsonValue): value is JsonObject =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const canonicalizeJsonValue = (value: JsonValue): string => {
    if (value === null) {
        return 'null';
    }

    if (Array.isArray(value)) {
        const serializedItems = value.map(canonicalizeJsonValue);
        return `[${serializedItems.join(',')}]`;
    }

    if (isJsonObject(value)) {
        const object: JsonObject = value;
        const sortedKeys = Object.keys(object)
            .slice()
            .sort((a, b) => a.localeCompare(b));
        const serialized = sortedKeys.map((key) => {
            const nestedValue = object[key];
            if (nestedValue === undefined) {
                return `${JSON.stringify(key)}:null`;
            }
            return `${JSON.stringify(key)}:${canonicalizeJsonValue(nestedValue)}`;
        });
        return `{${serialized.join(',')}}`;
    }

    return JSON.stringify(value);
};

const canonicalJsonString = (value: unknown): string => {
    const json = JSON.stringify(value);
    if (json === undefined) {
        throw new TypeError('Cannot stringify value to JSON');
    }
    const parsed = JSON.parse(json) as JsonValue;
    return canonicalizeJsonValue(parsed);
};

export function etagOf(doc: unknown): string {
    const canonical = canonicalJsonString(doc);
    return '"' + sha1(canonical) + '"';
}
