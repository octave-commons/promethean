---
title: "chore: format tests and update plugins"
status: "open"
created: "8/3/2025, 12:56:12 AM"
url: "https://github.com/riatzukiza/promethean/pull/163"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# chore: format tests and update plugins
## Summary
- run black and prettier on various tests
- update community plugins config for Obsidian vault

## Testing
- pre-commit run --files tests/scripts/testkanbantohashtags.py tests/scripts/testhashtagstokanban.py tests/portfolio.test.js vault-config/.obsidian/community-plugins.json
- pytest tests/scripts/testhashtagstokanban.py tests/scripts/testkanbantohashtags.py
- npx ava tests/portfolio.test.js


- - -- - -
https://chatgpt.com/codex/tasks/taske688ef50cf230832480ffcae4e7d763a5


