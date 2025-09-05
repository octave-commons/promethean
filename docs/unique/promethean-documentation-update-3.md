---
uuid: c9aeb36e-614a-449e-aec1-89752617001f
created_at: promethean-documentation-update-3.md
filename: JavaScript Pipeline Refactoring
title: JavaScript Pipeline Refactoring
description: >-
  This document outlines the need to refactor the current pipeline mechanism
  from CLI-based shell calls to pure JavaScript functions. The goal is to create
  exportable functions that can be composed within a single index file,
  eliminating the need for YAML configurations and CLI interactions. This
  approach improves maintainability and reduces brittleness in the system.
tags:
  - javascript
  - pipeline
  - refactoring
---


I need to spec out this pipeline mechanisim a little more
constanlty making and adjusting shell calls seems brittle.

When What I want is just to call js functions, from inside of js functions.
The pipeline should just be javascript using javascript, cut the yaml out cut the cli shit out. These don't need to be cl.

Docs
Preview

{
  "error": "hits is not iterable"
}

Logs

Starting pipeline in /home/err/devel/promethean/docs/unique
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
NotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
04-relations: ROOT=/home/err/devel/promethean/docs/unique, DOC_THRESHOLD=0.78, REF_THRESHOLD=0.85
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
Error: ENOENT: no such file or directory, open '/home/err/devel/promethean/docs/unique/.#2025.09.01.19.55.45.md'\n    at async open (node:internal/fs/promises:639:25)\n    at async Object.readFile (node:internal/fs/promises:1243:14)\n    at async main (/home/err/devel/promethean/packages/docops/src/06-rename.ts:30:17) {\n  errno: -2,\n  code: 'ENOENT',\n  syscall: 'open',\n  path: '/home/err/devel/promethean/docs/unique/.#2025.09.01.19.55.45.md'\n}
Done.


We need to turn each of these pipeine steps into exportable functions, and then have a single index.ts file that exports all of them.

Move away from calling these from a CLI

Eventually we're gonna compose together several of these pipelines, and we don't want to be calling the commandline from js world just to run javscript.
