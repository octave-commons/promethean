# SmartGPT Bridge

The SmartGPT bridge exposes utilities for searching the repository.

## grep

`services/ts/smartgpt-bridge/src/rg.js` implements `grep()` by shelling out to [ripgrep](https://github.com/BurntSushi/ripgrep).
It accepts the same options as before (`pattern`, `flags`, `paths`, `exclude`, `maxMatches`, `context`) but now
uses `rg --json` for fast searches and parses the results into the bridge's `{ path, line, column, lineText, snippet, startLine, endLine }` schema.

A thin shim remains at `src/grep.js` for backward compatibility.
