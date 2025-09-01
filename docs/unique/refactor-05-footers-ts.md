---
uuid: 80d4d883-59f9-401b-8699-7a2723148b1e
created_at: 2025.09.01.14.18.02.md
filename: Refactor 05-footers.ts
description: >-
  Refactor the 05-footers.ts file to use LevelDB for key-value storage, reduce
  complexity, and prefer functional and immutable approaches while avoiding
  loops and using promise error handling.
tags:
  - refactor
  - leveldb
  - functional
  - immutability
  - promises
related_to_uuid: []
related_to_title: []
references: []
---
Refactor 05-footers.ts under the following contraints:

2. use level db for kv store instead of json objects
3. reduce complexity
4. prefer functional style
5. prefer immutability
6. avoid loops
7. prefer then/catch methods when handling errors with promises.
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

const START = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
