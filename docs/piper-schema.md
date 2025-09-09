# Piper Schema Validation

Piper steps can declare JSON Schemas for their inputs and outputs. Before a step runs, Piper validates each input file against `inputSchema`. After the step completes, it checks any produced files against `outputSchema`.

```json
{
  "id": "transform",
  "shell": "node transform.js",
  "inputs": ["raw.json"],
  "outputs": ["clean.json"],
  "inputSchema": "raw.schema.json",
  "outputSchema": "clean.schema.json"
}
```

If any file fails its schema, the step exits with code `1`.
