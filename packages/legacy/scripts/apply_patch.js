#!/usr/bin/env node
import { runApplyPatch, sanitizeForLog } from "@promethean/apply-patch";

runApplyPatch().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error("[apply_patch] fatal", sanitizeForLog({ error }));
    process.exitCode = 1;
  },
);
