---
title: "fix: resolve cephalon ts type errors"
status: "open"
created: "8/3/2025, 2:44:09 AM"
url: "https://github.com/riatzukiza/promethean/pull/184"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# fix: resolve cephalon ts type errors
## Summary
- include service-specific declaration files in TypeScript build
- replace fragile test stubs with inline mocks

## Testing
- npm run build:check
- npm test *(fails: Cannot find module 'canvas' due to missing native dependency)*

- - -- - -
https://chatgpt.com/codex/tasks/taske688f0ded6bd4832490760ad4355ffe11


