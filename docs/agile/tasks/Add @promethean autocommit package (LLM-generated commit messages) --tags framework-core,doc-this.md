---
uuid: "afaec0f2-41a6-4676-a98e-1882d5a9ed4a"
title: "Add @promethean/autocommit package (LLM-generated commit messages) --tags framework-core,doc-this"
slug: "Add @promethean autocommit package (LLM-generated commit messages) --tags framework-core,doc-this"
status: "breakdown"
priority: "P1"
labels: ["autocommit", "package", "llm", "generated"]
created_at: "2025-10-18T17:46:34.229Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "0d60e9dc25bf562341924816d535262af1778bfb"
commitHistory:
  -
    sha: "0d60e9dc25bf562341924816d535262af1778bfb"
    timestamp: "2025-10-19 17:08:00 -0500\n\ndiff --git a/docs/agile/tasks/Implement LLM-powered kanban explain command.md b/docs/agile/tasks/Implement LLM-powered kanban explain command.md\nindex ff009df6c..8bd30c0c0 100644\n--- a/docs/agile/tasks/Implement LLM-powered kanban explain command.md\t\n+++ b/docs/agile/tasks/Implement LLM-powered kanban explain command.md\t\n@@ -10,11 +10,11 @@ estimates:\n   complexity: \"\"\n   scale: \"\"\n   time_to_completion: \"\"\n-lastCommitSha: \"7b510a77b68b6a05c98fbba55740b3ecb4adc451\"\n+lastCommitSha: \"f5dc98980302f62a931c0247bd3bc1e80a93d98e\"\n commitHistory:\n   -\n-    sha: \"7b510a77b68b6a05c98fbba55740b3ecb4adc451\"\n-    timestamp: \"2025-10-19T22:05:31.557Z\"\n+    sha: \"f5dc98980302f62a931c0247bd3bc1e80a93d98e\"\n+    timestamp: \"2025-10-19T22:08:00.567Z\"\n     message: \"Update task: 6866f097-f4c8-485a-8c1d-78de260459d2 - Update task: Implement LLM-powered kanban explain command\"\n     author: \"Error <foamy125@gmail.com>\"\n     type: \"update\""
    message: "Update task: 6866f097-f4c8-485a-8c1d-78de260459d2 - Update task: Implement LLM-powered kanban explain command"
    author: "Error"
    type: "update"
---

Implement autocommit package that watches git repo and auto-commits with LLM-generated messages using OpenAI-compatible endpoint (defaults to local Ollama).

## ✅ Implementation Complete

- ✅ Created `@promethean/autocommit` package with full structure
- ✅ Implemented file watching with chokidar and 10s debounce
- ✅ Added OpenAI-compatible LLM integration with fallback
- ✅ Configured for local Ollama (llama3.1:8b at localhost:11434/v1)
- ✅ Safety features: ignore patterns, diff size limits, dry-run mode
- ✅ CLI interface `autocommit` with comprehensive options
- ✅ Conventional Commits format (≤72 char subject)
- ✅ GPL-3.0-or-later license headers
- ✅ Tested CLI functionality with dry-run mode

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing
