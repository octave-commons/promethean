Scripts: Update CI and references post-reorg

Goal: Update CI workflows and docs to reflect new script locations and Make targets.

Scope:
- Search and replace old paths in docs and scripts invoking other scripts.
- Update any GitHub Actions to call Make targets instead of raw paths where possible.
- Verify path assumptions in tests (e.g., fixtures referencing script locations).

Exit Criteria:
- CI green with new structure; no broken references.

#scripts #ci #organization #accepted

