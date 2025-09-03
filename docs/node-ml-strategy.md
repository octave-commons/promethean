# Node ML Porting Strategy

#node #ml #whisper

## Node Equivalents

- **@xenova/transformers**: JavaScript/TypeScript transformers with ONNX Runtime backend.
  Supports models like Whisper for speech recognition.
- **onnxruntime-node**: Native Node.js bindings for ONNX Runtime allowing execution of ONNX models.

## Prototype

- [[scripts/whisper_test.ts]] uses @xenova/transformers to run a tiny Whisper model.
  It falls back to the existing Python [[scripts/whisper_test.py]] via child_process.spawn
  if the Node path fails.

## Trade-offs

- **Porting** keeps logic in a single runtime and simplifies deployment but may require
  downloading large models and can be slower.
- **Wrapping** leverages mature Python ecosystems but adds process management overhead.

## Recommendations

| Script | Approach |
|-------|----------|
| scripts/whisper_test.py | Port to TypeScript with fallback to Python |
| scripts/tts.py | Wrap Python — Node alternatives immature |
| scripts/stt.py | Wrap Python — depends on Python-only tools |

