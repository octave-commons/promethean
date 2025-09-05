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
related_to_uuid:
  - 90955a83-f6e5-4168-89e6-1e12eabed78b
  - 1f4a3423-555e-4d45-8c32-5b6b45914a4e
  - cfb15342-0e5d-444b-9e96-3f8758071609
  - 0a8255a5-ef49-4a1e-ae71-b2f57eb7bdf8
  - 792a343e-674c-4bb4-8435-b3f8c163349d
related_to_title:
  - Exception Layer Analysis
  - refactor-relations
  - Refactor Frontmatter Processing
  - Functional Refactor of TypeScript Document Processing
  - windows-tiling-with-autohotkey
references:
  - uuid: 90955a83-f6e5-4168-89e6-1e12eabed78b
    line: 1
    col: 0
    score: 1
  - uuid: 1f4a3423-555e-4d45-8c32-5b6b45914a4e
    line: 3
    col: 0
    score: 0.99
  - uuid: 1f4a3423-555e-4d45-8c32-5b6b45914a4e
    line: 8
    col: 0
    score: 0.98
  - uuid: cfb15342-0e5d-444b-9e96-3f8758071609
    line: 4
    col: 0
    score: 0.97
  - uuid: 1f4a3423-555e-4d45-8c32-5b6b45914a4e
    line: 6
    col: 0
    score: 0.97
  - uuid: 1f4a3423-555e-4d45-8c32-5b6b45914a4e
    line: 4
    col: 0
    score: 0.95
  - uuid: 1f4a3423-555e-4d45-8c32-5b6b45914a4e
    line: 5
    col: 0
    score: 0.93
  - uuid: 1f4a3423-555e-4d45-8c32-5b6b45914a4e
    line: 7
    col: 0
    score: 0.93
  - uuid: cfb15342-0e5d-444b-9e96-3f8758071609
    line: 7
    col: 0
    score: 0.9
  - uuid: cfb15342-0e5d-444b-9e96-3f8758071609
    line: 9
    col: 0
    score: 0.89
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
df-828f-e219cc9442eb
    line: 513
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 618
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 187
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 999
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 519
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 466
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 505
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 451
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 178
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 437
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 367
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 378
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
  - uuid: 814b1bc2-cb40-4387-9f73-5af386aaf003
    line: 3
    col: 0
    score: 1
  - uuid: 814b1bc2-cb40-4387-9f73-5af386aaf003
    line: 5
    col: 0
    score: 1
  - uuid: 814b1bc2-cb40-4387-9f73-5af386aaf003
    line: 7
    col: 0
    score: 1
  - uuid: 814b1bc2-cb40-4387-9f73-5af386aaf003
    line: 9
    col: 0
    score: 1
  - uuid: 814b1bc2-cb40-4387-9f73-5af386aaf003
    line: 11
    col: 0
    score: 1
  - uuid: 814b1bc2-cb40-4387-9f73-5af386aaf003
    line: 17
    col: 0
    score: 1
  - uuid: 814b1bc2-cb40-4387-9f73-5af386aaf003
    line: 19
    col: 0
    score: 1
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 6
    col: 0
    score: 0.97
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 10
    col: 0
    score: 0.93
  - uuid: cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
    line: 7
    col: 0
    score: 0.9
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 376
    col: 0
    score: 0.87
  - uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
    line: 289
    col: 0
    score: 0.87
  - uuid: b6ae7dfa-0c53-4eb9-aea8-65072b825bee
    line: 40
    col: 0
    score: 0.87
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 0.86
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.86
  - uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
    line: 217
    col: 0
    score: 0.86
  - uuid: d41a06d1-613e-4440-80b7-4553fc694285
    line: 56
    col: 0
    score: 0.85
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
