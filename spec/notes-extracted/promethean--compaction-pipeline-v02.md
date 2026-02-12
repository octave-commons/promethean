---
title: "Compaction Pipeline v0.2: summarize-by-cluster, preserve nexus connectivity, safe deletes #gc #compaction #summaries #nexus"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/compaction-pipeline-v02.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Compaction Pipeline v0.2: summarize-by-cluster, preserve nexus connectivity, safe deletes #gc #compaction #summaries #nexus

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/compaction-pipeline-v02.md`
- Category: `promethean`

## Draft Requirements
- it compacts **clusters**, not random singles
- it guarantees **nexus connectivity survives**
- it guarantees **vector + nexus cleanup is crash-safe**
- it avoids “summary-of-summary collapse”
- it supports “embed the same content many times” via lineage caps
- spam families (`cluster.spam_family_id`)
- tool-call sequences (`cluster.thread_id` or adjacency windows)
- file path nexus (`path:*`)
- error family nexus (`err:*`)
- conversation threads (session scoped)
- e.g., “memories sharing `path:X` + `tool:fs.read` within 48h”
- summaries become meaningful “hubs”

## Summary Snippets
- You already sketched GC as: “oldest, least accessed memories get summarized; summary kept; rest deleted.” This version makes that robust and *Eidolon-native*:
- * it compacts **clusters**, not random singles * it guarantees **nexus connectivity survives** * it guarantees **vector + nexus cleanup is crash-safe** * it avoids “summary-of-summary collapse” * it supports “embed the same content many times” via lineage caps

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
