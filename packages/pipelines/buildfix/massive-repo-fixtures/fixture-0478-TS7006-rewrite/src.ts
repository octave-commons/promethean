import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

type Rewrite = (from) => string | null;

export const mkAliasRewriter =
  (fromPrefix = "@old", toPrefix = "@new-"): Rewrite =>
  (spec) => {
    if (!spec.startsWith(fromPrefix)) return null;
    const rest = spec.slice(fromPrefix.length).replace(/^\/+/, "");
    if (rest.length === 0) return "__ALIAS_REWRITE_ERROR__ROOT_IMPORT__";
    const [folder, ...tail] = rest.split("/");
    if (!folder) return "__ALIAS_REWRITE_ERROR__BAD_SEGMENT__";
    const newLeft = `${toPrefix}${folder}`;
    return [newLeft, ...tail].join("/");
  };

export const isRelative = (s): boolean =>
  s.startsWith("./") || s.startsWith("../");

const hasExt = (s): boolean => /\.[a-z]+$/i.test(s);
const toJs = (s) =>
  /\.[mc]?tsx?$/.test(s) ? s.replace(/\.[mc]?tsx?$/i, ".js") : `${s}.js`;

const tryIndex = (absNoExt) | null => {
  const idx = join(absNoExt, "index");
  const exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];
  const hit = exts.find((e) => existsSync(idx + e));
  return hit ? toJs(idx) : null;
};

export const mkRelativeToJs =
  (fromFile) =>
  (spec) => {
    if (!isRelative(spec) || hasExt(spec)) return spec;
    const baseDir = dirname(fromFile);
    const absNoExt = join(baseDir, spec);
    const exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];
    const fileHit = exts.find((e) => existsSync(absNoExt + e));
    if (fileHit) return toJs(spec);
    const idx = tryIndex(absNoExt);
    if (idx) return `${spec.replace(/\/+$/, "")}/index.js`;
    return `${spec}.js`;
  };
