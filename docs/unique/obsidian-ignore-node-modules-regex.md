---
uuid: 64f82407-7166-4ba7-94c0-985bdf8b8997
created_at: obsidian-ignore-node-modules-regex.md
filename: obsidian-ignore-node-modules-regex
title: obsidian-ignore-node-modules-regex
description: >-
  Provides regex patterns to exclude node_modules folder from Obsidian's file
  exclusion list, supporting both Unix and Windows path separators.
tags:
  - regex
  - obsidian
  - node_modules
  - file exclusion
  - path separator
  - cross-platform
---
Note: Consolidated here → ../notes/tooling/obsidian-ignore-node-modules-regex.md ^ref-ffb9b2a9-1-0

Ah — so you want a regex that **only matches** things inside a `node_modules` folder. ^ref-ffb9b2a9-3-0
That way, Obsidian can use it in the "Exclude files" list to filter them out.

For Unix-style `/` paths: ^ref-ffb9b2a9-6-0

```regex
.*/node_modules/.*  
```
^ref-ffb9b2a9-8-0 ^ref-ffb9b2a9-11-0
 ^ref-ffb9b2a9-12-0
For Windows `\` paths:
 ^ref-ffb9b2a9-14-0
```regex
.*\\node_modules\\.*  
^ref-ffb9b2a9-14-0
``` ^ref-ffb9b2a9-18-0
^ref-ffb9b2a9-15-0

**Explanation:**
 ^ref-ffb9b2a9-21-0
* `.*` → anything before
* `/node_modules/` (or `\\node_modules\\`) → folder name with slashes around it
* `.*` → anything after ^ref-ffb9b2a9-24-0

This will match: ^ref-ffb9b2a9-26-0

```
node_modules/foo.js
src/node_modules/bar/index.js
^ref-ffb9b2a9-26-0
packages/pkg-a/node_modules/pkg-b/file.js
```

And won’t match anything outside `node_modules`.
 ^ref-ffb9b2a9-36-0
---
 ^ref-ffb9b2a9-38-0
If your Obsidian vault is cross-platform, you can make it portable:

^ref-ffb9b2a9-38-0
```regex ^ref-ffb9b2a9-42-0
.*[\\/]+node_modules[\\/]+.*
```

That matches either `/` or `\` as the path separator. ^ref-ffb9b2a9-46-0

--- ^ref-ffb9b2a9-48-0
 ^ref-ffb9b2a9-49-0
I can also give you a **faster variant** that doesn’t do as much backtracking if you’re matching huge file lists. Want me to do that?
