---
title: "Add Hy implementations and compile workflow for Python services"
status: "open"
created: "8/3/2025, 4:22:22 AM"
url: "https://github.com/riatzukiza/promethean/pull/190"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# Add Hy implementations and compile workflow for Python services
## Summary
- add Hy-based versions of discord indexer, attachment indexer, stt websocket, and whisper stream websocket services
- introduce build-hy target and compilation script to transpile Hy sources to Python

## Testing
- python scripts/compilehy.py
- flake8 services/py/discordattachmentindexer services/py/discordindexer services/py/sttws services/py/whisperstreamws *(fails: command not found)*
- black services/py/discordattachmentindexer services/py/discordindexer services/py/sttws services/py/whisperstreamws
- pytest services/py/discordattachmentindexer/tests services/py/discordindexer/tests services/py/sttws/tests services/py/whisperstreamws/tests *(fails: ModuleNotFoundError: No module named 'discord')*


- - -- - -
https://chatgpt.com/codex/tasks/taske688f1cf081748324b8d7d93ed0e29803


