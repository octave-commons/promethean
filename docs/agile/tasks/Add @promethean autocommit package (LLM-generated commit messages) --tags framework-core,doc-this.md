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
