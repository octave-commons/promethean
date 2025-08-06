# generate_orphan_docs.py

Generates mirrored documentation files for entries listed in `orphaned-files-report.md`.
For each listed path outside of `docs/`, the script creates a corresponding
`docs/<path>.md` file and uses `ollama` to produce a short description based on
the file's contents.

Run it with:

```bash
python scripts/generate_orphan_docs.py
```
