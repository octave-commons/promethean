---
uuid: 909312f1-5feb-4503-a6fa-10a710aa7429
created_at: refactor-05-footers-ts.md
filename: refactor-05-footers
title: refactor-05-footers
description: >-
  Refactors footer sections to use LevelDB for key-value storage, reducing
  complexity and improving immutability while avoiding loops and favoring
  functional style with promise error handling.
tags:
  - refactor
  - leveldb
  - key-value
  - immutability
  - functional
  - promises
  - error-handling
---
Refactor 05-footers.ts under the following contraints: ^ref-80d4d883-1-0

2. use level db for kv store instead of json objects ^ref-80d4d883-3-0
3. reduce complexity ^ref-80d4d883-4-0
4. prefer functional style ^ref-80d4d883-5-0
5. prefer immutability ^ref-80d4d883-6-0
6. avoid loops ^ref-80d4d883-7-0
7. prefer then/catch methods when handling errors with promises. ^ref-80d4d883-8-0
``` typescript

import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, readJSON, stripGeneratedSections, relMdLink, anchorId, injectAnchors } from "./utils";
import type { Front } from "./types";

const args = parseArgs({
  "--dir": "docs/unique",
  "--anchor-style": "block", // "block" | "heading" | "none"
  "--include-related": "true",
  "--include-sources": "true",
  "--dry-run": "false",
});

const ROOT = path.resolve(args["--dir"]);
const ANCHOR_STYLE = args["--anchor-style"] as "block" | "heading" | "none";
const INCLUDE_RELATED = args["--include-related"] === "true";
const INCLUDE_SOURCES = args["--include-sources"] === "true";
const DRY = args["--dry-run"] === "true";

const START = "
