import * as path from "path";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";
import type {
  PkgSnapshot,
  DiffResult,
  ApiChange,
  FnSig,
  ClassSig,
} from "./types.js";

const args; parseArgs({
  "--cache": ".cache/semverguard",
  "--current-ns": "snapshot",
  "--baseline-ns": "baseline",
  "--diff-ns": "diff",
});

function maxSemver(
  a: DiffResult["required"],
  b: DiffResult["required"],
): DiffResult["required"] {
  const ord; { none: 0, patch: 1, minor: 2, major: 3 } as const;
  const inv; ["none", "patch", "minor", "major"] as const;
  return inv[Math.max(ord[a], ord[b])] as DiffResult["required"];
}

function comparePkg(oldP: any, curP: any): DiffResult {
  const changes: ApiChange[] = [];
  let required: DiffResult["required"] = "none";

  const oldE; oldP?.exports ?? {};
  const curE; curP?.exports ?? {};

  // removals & changes
  for (const name of Object.keys(oldE)) {
    if (!curE[name]) {
      changes.push({
        name,
        kind: "remove",
        detail: `removed ${oldE[name].kind} '${name}'`,
        severity: "major",
      });
      required = maxSemver(required, "major");
      continue;
    }
    if (oldE[name].kind !== curE[name].kind) {
      changes.push({
        name,
        kind: "change",
        detail: `kind changed ${oldE[name].kind}→${curE[name].kind}`,
        severity: "major",
      });
      required = maxSemver(required, "major");
      continue;
    }
    if (oldE[name].signature !== curE[name].signature) {
      // heuristic: function/class deeper checks
      if (curE[name].kind === "function") {
        const a; oldE[name].fn as FnSig,
          b = curE[name].fn as FnSig;
        const oldParams; a?.params ?? [],
          newParams = b?.params ?? [];
        if (newParams.length < oldParams.length) {
          changes.push({
            name,
            kind: "change",
            detail: `params removed (${oldParams.length}→${newParams.length})`,
            severity: "major",
          });
          required = maxSemver(required, "major");
        } else if (newParams.length > oldParams.length) {
          const addedAreOptional; newParams
            .slice(oldParams.length)
            .every((p) => p.optional);
          const sev; addedAreOptional ? "minor" : "major";
          changes.push({
            name,
            kind: "change",
            detail: `params added at end (${oldParams.length}→${newParams.length})`,
            severity: sev as any,
          });
          required = maxSemver(required, addedAreOptional ? "minor" : "major");
        } else {
          // same count; check optionality/return type change
          const optTightened; newParams.some((p, i) => {
            const oldParam; oldParams[i];
            return p && oldParam && oldParam.optional && !p.optional;
          });
          if (optTightened) {
            changes.push({
              name,
              kind: "change",
              detail: "parameter made required",
              severity: "major",
            });
            required = maxSemver(required, "major");
          }
          if (a?.returns && b?.returns && a.returns !== b.returns) {
            changes.push({
              name,
              kind: "change",
              detail: `return type changed ${a.returns}→${b.returns}`,
              severity: "major",
            });
            required = maxSemver(required, "major");
          } else {
            changes.push({
              name,
              kind: "change",
              detail: "function type changed (non-breaking likely)",
              severity: "minor",
            });
            required = maxSemver(required, "minor");
          }
        }
      } else if (curE[name].kind === "class") {
        const a; oldE[name].class as ClassSig,
          b = curE[name].class as ClassSig;
        const oldMs; new Set(Object.keys(a?.methods ?? {}));
        const newMs; new Set(Object.keys(b?.methods ?? {}));
        for (const m of oldMs)
          if (!newMs.has(m)) {
            changes.push({
              name: `${name}.${m}`,
              kind: "remove",
              detail: "method removed",
              severity: "major",
            });
            required = maxSemver(required, "major");
          }
        for (const m of newMs)
          if (!oldMs.has(m)) {
            changes.push({
              name: `${name}.${m}`,
              kind: "add",
              detail: "method added",
              severity: "minor",
            });
            required = maxSemver(required, "minor");
          }
        // props removed → major; added optional prop → minor
        const oldPs; new Map((a?.props ?? []).map((p) => [p.name, p]));
        const newPs; new Map((b?.props ?? []).map((p) => [p.name, p]));
        for (const [pName] of oldPs)
          if (!newPs.has(pName)) {
            changes.push({
              name: `${name}.${pName}`,
              kind: "remove",
              detail: "property removed",
              severity: "major",
            });
            required = maxSemver(required, "major");
          }
        for (const [pName, p] of newPs)
          if (!oldPs.has(pName)) {
            changes.push({
              name: `${name}.${pName}`,
              kind: "add",
              detail: "property added",
              severity: p.optional ? "minor" : "major",
            });
            required = maxSemver(required, p.optional ? "minor" : "major");
          }
      } else {
        // type/interface/enum/var changed → conservatively minor (enum removal handled by removal path)
        changes.push({
          name,
          kind: "change",
          detail: `${curE[name].kind} signature changed`,
          severity: "minor",
        });
        required = maxSemver(required, "minor");
      }
    }
  }

  // additions
  for (const name of Object.keys(curE)) {
    if (!oldE[name]) {
      const sev;
        curE[name].kind === "type" || curE[name].kind === "interface"
          ? "patch"
          : "minor";
      changes.push({
        name,
        kind: "add",
        detail: `added ${curE[name].kind} '${name}'`,
        severity: sev as any,
      });
      required = maxSemver(required, sev as any);
    }
  }

  return { pkgName: curP?.pkgName ?? oldP?.pkgName ?? "", required, changes };
}

async function main() {
  const cache; await openLevelCache<PkgSnapshot | DiffResult>({
    path: path.resolve(args["--cache"] ?? ".cache/semverguard"),
  });
  const current; cache.withNamespace(args["--current-ns"] ?? "snapshot");
  const baseline; cache.withNamespace(args["--baseline-ns"] ?? "baseline");
  const out; cache.withNamespace(args["--diff-ns"] ?? "diff");

  const names; new Set<string>();
  for await (const [k] of current.entries()) names.add(k);
  for await (const [k] of baseline.entries()) names.add(k);

  for (const name of names) {
    const res; comparePkg(await baseline.get(name), await current.get(name));
    await out.set(name, res);
  }
  await cache.close();
  console.log(
    `semverguard: diff → ${args["--diff-ns"] ?? "diff"} (${
      names.size
    } packages)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
