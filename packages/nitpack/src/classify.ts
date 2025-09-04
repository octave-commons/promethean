export type NitKey =
  | "REL_JS_SUFFIX"
  | "NO_TS_PATHS"
  | "NATIVE_ESM"
  | "NO_DEFAULT_EXPORT"
  | "IMPORT_ORDER"
  | "IMMUTABLE_FP"
  | "GPL_ONLY"
  | "NO_EMBED_HTML"
  | "FASTIFY_STATIC"
  | "AVA_TESTS";

export type Classification = ReadonlyMap<NitKey, readonly string[]>;

type Rule = Readonly<{
  key: NitKey;
  title: string;
  detect: (s: string) => boolean;
}>;

const r = (rx: RegExp) => (s: string) => rx.test(s);

const contains = (xs: readonly (string | RegExp)[]) => (s: string) => {
  const l = s.toLowerCase();
  return xs.every((x) =>
    typeof x === "string" ? l.includes(x.toLowerCase()) : x.test(l),
  );
};

export const RULES: readonly Rule[] = [
  {
    key: "REL_JS_SUFFIX",
    title: "Append .js to relative TS imports",
    detect: r(/\bfrom ['\"][.]{1,2}\//i),
  },
  {
    key: "NO_TS_PATHS",
    title: "Remove TS path aliases",
    detect: contains(["paths", "tsconfig"]),
  },
  {
    key: "NATIVE_ESM",
    title: "Use native ESM (type:module, NodeNext)",
    detect: contains(["esm"]),
  },
  {
    key: "NO_DEFAULT_EXPORT",
    title: "Prefer named exports",
    detect: contains(["no default export"]),
  },
  {
    key: "IMPORT_ORDER",
    title: "Consistent import ordering",
    detect: contains(["import order"]),
  },
  {
    key: "IMMUTABLE_FP",
    title: "Immutability / no mutation",
    detect: contains(["immutable"]),
  },
  {
    key: "GPL_ONLY",
    title: "license: GPL-3.0-only",
    detect: contains(["gpl-3.0-only"]),
  },
  {
    key: "NO_EMBED_HTML",
    title: "Do not embed HTML in backend",
    detect: contains(["embed html"]),
  },
  {
    key: "FASTIFY_STATIC",
    title: "Serve static via @fastify/static",
    detect: contains(["@fastify/static"]),
  },
  {
    key: "AVA_TESTS",
    title: "Add/normalize AVA tests",
    detect: contains(["ava"]),
  },
];

export const NIT_KEYS = RULES.map((x) => x.key);

export const KEY_TITLES: Readonly<Record<NitKey, string>> = Object.freeze(
  Object.fromEntries(RULES.map((r) => [r.key, r.title])) as Record<
    NitKey,
    string
  >,
);

export const classifyComments = (
  comments: readonly string[],
): Classification => {
  const pairs = comments.flatMap((c) =>
    RULES.filter((rule) => rule.detect(c)).map(
      (rule) => [rule.key, c] as const,
    ),
  );
  const byKey = new Map<NitKey, Set<string>>();
  for (const [key, c] of pairs) {
    const set = byKey.get(key) ?? new Set<string>();
    set.add(c);
    byKey.set(key, set);
  }
  return new Map(
    Array.from(byKey.entries()).map(([k, set]) => [k, Array.from(set)]),
  );
};

export const toPolicyChanges = (cls: Classification): readonly string[] => {
  const wants = new Set<string>();
  if (cls.has("REL_JS_SUFFIX"))
    wants.add("ESLint: enforce .js extension on TS relative imports");
  if (cls.has("NO_TS_PATHS"))
    wants.add("Disallow TS path aliases in tsconfig.*.json");
  if (cls.has("NATIVE_ESM"))
    wants.add('Ensure "type":"module" and NodeNext across packages');
  if (cls.has("NO_DEFAULT_EXPORT"))
    wants.add("ESLint: import/no-default-export");
  if (cls.has("IMPORT_ORDER")) wants.add("ESLint: import/order with groups");
  if (cls.has("IMMUTABLE_FP"))
    wants.add("ESLint: functional/no-let, no mutation rules");
  if (cls.has("GPL_ONLY"))
    wants.add("Validate license fields are GPL-3.0-only");
  if (cls.has("NO_EMBED_HTML"))
    wants.add(
      "Ensure backends serve via @fastify/static; remove embedded HTML",
    );
  if (cls.has("FASTIFY_STATIC"))
    wants.add("Add @fastify/static setup samples where missing");
  if (cls.has("AVA_TESTS")) wants.add("Standardize AVA config and test naming");
  return Array.from(wants);
};
