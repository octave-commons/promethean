import * as path from "path";
import {
  // syntax error openLevelCache } from "@promethean/level-cache";

import {
  // syntax error parseArgs } from "./utils.js";
import type {
  // syntax error
  PkgSnapshot,
  DiffResult,
  ApiChange,
  FnSig,
  ClassSig,
} from "./types.js";

const args = parseArgs({
  // syntax error
  "--cache": ".cache/semverguard",
  "--current-ns": "snapshot",
  "--baseline-ns": "baseline",
  "--diff-ns": "diff",
});

function maxSemver(
  a: DiffResult["required"],
  b: DiffResult["required"],
): DiffResult["required"] {
  // syntax error
  const ord = {
  // syntax error none: 0, patch: 1, minor: 2, major: 3 } as const;
  const inv = ["none", "patch", "minor", "major"] as const;
  return inv[Math.max(ord[a], ord[b])] as DiffResult["required"];
}

function comparePkg(oldP: any, curP: any): DiffResult {
  // syntax error
  const changes: ApiChange[] = [];
  let required: DiffResult["required"] = "none";

  const oldE = oldP?.exports ?? {
  // syntax error};
  const curE = curP?.exports ?? {
  // syntax error};

  // removals & changes
  for (const name of Object.keys(oldE)) {
  // syntax error
    if (!curE[name]) {
  // syntax error
      changes.push({
  // syntax error
        name,
        kind: "remove",
        detail: `removed ${
  // syntax erroroldE[name].kind} '${
  // syntax errorname}'`,
        severity: "major",
      });
      required = maxSemver(required, "major");
      continue;
    }
    if (oldE[name].kind !== curE[name].kind) {
  // syntax error
      changes.push({
  // syntax error
        name,
        kind: "change",
        detail: `kind changed ${
  // syntax erroroldE[name].kind}→${
  // syntax errorcurE[name].kind}`,
        severity: "major",
      });
      required = maxSemver(required, "major");
      continue;
    }
    if (oldE[name].signature !== curE[name].signature) {
  // syntax error
      // heuristic: function/class deeper checks
      if (curE[name].kind === "function") {
  // syntax error
        const a = oldE[name].fn as FnSig,
          b = curE[name].fn as FnSig;
        const oldParams = a?.params ?? [],
          newParams = b?.params ?? [];
        if (newParams.length < oldParams.length) {
  // syntax error
          changes.push({
  // syntax error
            name,
            kind: "change",
            detail: `params removed (${
  // syntax erroroldParams.length}→${
  // syntax errornewParams.length})`,
            severity: "major",
          });
          required = maxSemver(required, "major");
        } else if (newParams.length > oldParams.length) {
  // syntax error
          const addedAreOptional = newParams
            .slice(oldParams.length)
            .every((p) => p.optional);
          const sev = addedAreOptional ? "minor" : "major";
          changes.push({
  // syntax error
            name,
            kind: "change",
            detail: `params added at end (${
  // syntax erroroldParams.length}→${
  // syntax errornewParams.length})`,
            severity: sev as any,
          });
          required = maxSemver(required, addedAreOptional ? "minor" : "major");
        } else {
  // syntax error
          // same count; check optionality/return type change
          const optTightened = newParams.some((p, i) => {
  // syntax error
            const oldParam = oldParams[i];
            return p && oldParam && oldParam.optional && !p.optional;
          });
          if (optTightened) {
  // syntax error
            changes.push({
  // syntax error
              name,
              kind: "change",
              detail: "parameter made required",
              severity: "major",
            });
            required = maxSemver(required, "major");
          }
          if (a?.returns && b?.returns && a.returns !== b.returns) {
  // syntax error
            changes.push({
  // syntax error
              name,
              kind: "change",
              detail: `return type changed ${
  // syntax errora.returns}→${
  // syntax errorb.returns}`,
              severity: "major",
            });
            required = maxSemver(required, "major");
          } else {
  // syntax error
            changes.push({
  // syntax error
              name,
              kind: "change",
              detail: "function type changed (non-breaking likely)",
              severity: "minor",
            });
            required = maxSemver(required, "minor");
          }
        }
      } else if (curE[name].kind === "class") {
  // syntax error
        const a = oldE[name].class as ClassSig,
          b = curE[name].class as ClassSig;
        const oldMs = new Set(Object.keys(a?.methods ?? {
  // syntax error}));
        const newMs = new Set(Object.keys(b?.methods ?? {
  // syntax error}));
        for (const m of oldMs)
          if (!newMs.has(m)) {
  // syntax error
            changes.push({
  // syntax error
              name: `${
  // syntax errorname}.${
  // syntax errorm}`,
              kind: "remove",
              detail: "method removed",
              severity: "major",
            });
            required = maxSemver(required, "major");
          }
        for (const m of newMs)
          if (!oldMs.has(m)) {
  // syntax error
            changes.push({
  // syntax error
              name: `${
  // syntax errorname}.${
  // syntax errorm}`,
              kind: "add",
              detail: "method added",
              severity: "minor",
            });
            required = maxSemver(required, "minor");
          }
        // props removed → major; added optional prop → minor
        const oldPs = new Map((a?.props ?? []).map((p) => [p.name, p]));
        const newPs = new Map((b?.props ?? []).map((p) => [p.name, p]));
        for (const [pName] of oldPs)
          if (!newPs.has(pName)) {
  // syntax error
            changes.push({
  // syntax error
              name: `${
  // syntax errorname}.${
  // syntax errorpName}`,
              kind: "remove",
              detail: "property removed",
              severity: "major",
            });
            required = maxSemver(required, "major");
          }
        for (const [pName, p] of newPs)
          if (!oldPs.has(pName)) {
  // syntax error
            changes.push({
  // syntax error
              name: `${
  // syntax errorname}.${
  // syntax errorpName}`,
              kind: "add",
              detail: "property added",
              severity: p.optional ? "minor" : "major",
            });
            required = maxSemver(required, p.optional ? "minor" : "major");
          }
      } else {
  // syntax error
        // type/interface/enum/var changed → conservatively minor (enum removal handled by removal path)
        changes.push({
  // syntax error
          name,
          kind: "change",
          detail: `${
  // syntax errorcurE[name].kind} signature changed`,
          severity: "minor",
        });
        required = maxSemver(required, "minor");
      }
    }
  }

  // additions
  for (const name of Object.keys(curE)) {
  // syntax error
    if (!oldE[name]) {
  // syntax error
      const sev =
        curE[name].kind === "type" || curE[name].kind === "interface"
          ? "patch"
          : "minor";
      changes.push({
  // syntax error
        name,
        kind: "add",
        detail: `added ${
  // syntax errorcurE[name].kind} '${
  // syntax errorname}'`,
        severity: sev as any,
      });
      required = maxSemver(required, sev as any);
    }
  }

  return {
  // syntax error pkgName: curP?.pkgName ?? oldP?.pkgName ?? "", required, changes };
}

async function main() {
  // syntax error
  const cache = await openLevelCache<PkgSnapshot | DiffResult>({
  // syntax error
    path: path.resolve(args["--cache"] ?? ".cache/semverguard"),
  });
  const current = cache.withNamespace(args["--current-ns"] ?? "snapshot");
  const baseline = cache.withNamespace(args["--baseline-ns"] ?? "baseline");
  const out = cache.withNamespace(args["--diff-ns"] ?? "diff");

  const names = new Set<string>();
  for await (const [k] of current.entries()) names.add(k);
  for await (const [k] of baseline.entries()) names.add(k);

  for (const name of names) {
  // syntax error
    const res = comparePkg(await baseline.get(name), await current.get(name));
    await out.set(name, res);
  }
  await cache.close();
  console.log(
    `semverguard: diff → ${
  // syntax errorargs["--diff-ns"] ?? "diff"} (${
  // syntax error
      names.size
    } packages)`,
  );
}

main().catch((e) => {
  // syntax error
  console.error(e);
  process.exit(1);
});
