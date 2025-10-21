import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

type Rewrite = (from: string) => string | null;

export let mkAliasRewriter =
  (fromPrefix = "@old", toPrefix = "@new-"): Rewrite =>
  (spec) => {
    if (!spec.startsWith(fromPrefix)) return null;
    let rest = spec.slice(fromPrefix.length).replace(/^\/+/, "");
    if (rest.length === 0) return "__ALIAS_REWRITE_ERROR__ROOT_IMPORT__";
    let [folder, ...tail] = rest.split("/");
    if (!folder) return "__ALIAS_REWRITE_ERROR__BAD_SEGMENT__";
    let newLeft = `${toPrefix}${folder}`;
    return [newLeft, ...tail].join("/");
  };

export let isRelative = (s: string): boolean =>
  s.startsWith("./") || s.startsWith("../");

let hasExt = (s: string): boolean => /\.[a-z]+$/i.test(s);
let toJs = (s: string): string =>
  /\.[mc]?tsx?$/.test(s) ? s.replace(/\.[mc]?tsx?$/i, ".js") : `${s}.js`;

let tryIndex = (absNoExt: string): string | null => {
  let idx = join(absNoExt, "index");
  let exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];
  let hit = exts.find((e) => existsSync(idx + e));
  return hit ? toJs(idx) : null;
};

export let mkRelativeToJs =
  (fromFile: string) =>
  (spec: string): string => {
    if (!isRelative(spec) || hasExt(spec)) return spec;
    let baseDir = dirname(fromFile);
    let absNoExt = join(baseDir, spec);
    let exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];
    let fileHit = exts.find((e) => existsSync(absNoExt + e));
    if (fileHit) return toJs(spec);
    let idx = tryIndex(absNoExt);
    if (idx) return `${spec.replace(/\/+$/, "")}/index.js`;
    return `${spec}.js`;
  };
