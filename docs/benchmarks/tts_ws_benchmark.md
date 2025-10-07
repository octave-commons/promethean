# TTS WebSocket Benchmark
$$
**Path**: `scripts/bench_tts_ws.py`
$$
**Description**: Measures round-trip latency of the WebSocket-based text to speech service.

## Dependencies
- websockets

## Usage
```bash
python scripts/bench_tts_ws.py --host localhost --port 5004 --text "Hello" -n 5
```
