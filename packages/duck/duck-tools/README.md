# duck-tools smoke CLI

Simple smoke test for blob framing: reads a file, chunks to 1 MiB, computes sha256, prints stats.

## Usage

```bash
pnpm -F @promethean/duck-tools build
node dist/smoke.js ./path/to/file.bin
```

**Output** (example):

```json
{
  "chunks": 9,
  "totalBytes": 8703181,
  "streamedBytes": 8703181,
  "reducedBytes": 8703181,
  "sha256": "❤️..."
}
```