const BASE64_ENCODING = "base64";
const UTF8_ENCODING = "utf-8";
const whitespacePattern = /\s+/g;
const base64Pattern =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

type GithubPayload =
  | ReadonlyArray<GithubPayload>
  | Readonly<Record<string, unknown>>
  | string
  | number
  | boolean
  | null
  | undefined;

type GithubBase64Node = Readonly<{
  readonly encoding: string;
  readonly content: string;
}>;

const stripWhitespace = (value: string): string =>
  value.replace(whitespacePattern, "");

const normalizeBase64String = (value: string): string =>
  Buffer.from(value, "base64").toString("base64").replace(/=+$/, "");

const isValidBase64 = (value: string): boolean =>
  base64Pattern.test(value) &&
  normalizeBase64String(value) === value.replace(/=+$/, "");

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isGithubBase64Node = (
  value: Readonly<Record<string, unknown>>,
): value is GithubBase64Node =>
  typeof value.encoding === "string" &&
  value.encoding.toLowerCase() === BASE64_ENCODING &&
  typeof value.content === "string";

const decodeBase64Content = (
  value: GithubBase64Node,
): Readonly<Record<string, unknown>> => {
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
  } as const;
};

const transformNode = (value: GithubPayload): GithubPayload => {
  if (Array.isArray(value)) {
    const items = value as ReadonlyArray<GithubPayload>;
    return items.map((item) => transformNode(item)) as readonly GithubPayload[];
  }
  if (isRecord(value)) {
    const entries = Object.entries(value) as ReadonlyArray<
      readonly [string, GithubPayload]
    >;
    const transformedEntries = entries.map(
      ([key, entry]) => [key, transformNode(entry)] as const,
    );
    const transformed = Object.fromEntries(transformedEntries) as Readonly<
      Record<string, unknown>
    >;
    if (isGithubBase64Node(transformed)) {
      return decodeBase64Content(transformed);
    }
    return transformed;
  }
  return value;
};

export const normalizeGithubPayload = <T>(value: T): T =>
  transformNode(value as GithubPayload) as T;

export const isBase64String = (value: string): boolean =>
  isValidBase64(stripWhitespace(value));
