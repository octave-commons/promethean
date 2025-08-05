---
title: "Add missing service lint patterns"
status: "open"
created: "8/5/2025, 1:44:23 AM"
url: "https://github.com/riatzukiza/promethean/pull/218"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# Add missing service lint patterns
## Summary
- support lint targets for individual services in root Makefile

## Testing
- make install *(fails: pip install interrupted)*
- make build *(fails: npm run build exit 2)*
- make lint *(fails: eslint returned non-zero exit status)*
- make typecheck-python *(fails: mypy exit status 2)*
- make typecheck-ts *(fails: npx tsc --noEmit exit status 2)*
- make test *(fails: pipenv tests exit status 2)*
- make format


- - -- - -
https://chatgpt.com/codex/tasks/taske689169e2f130832483d71b47aa4c0e0d


