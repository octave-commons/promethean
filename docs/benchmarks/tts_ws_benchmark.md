# TTS WebSocket Benchmark

**Path**: `scripts/py/bench_tts_ws.py`

**Description**: Measures round-trip latency of the WebSocket-based text to speech service.

## Dependencies
- websockets

## Usage
```bash
python scripts/py/bench_tts_ws.py --host localhost --port 5003 --text "Hello" -n 5
```
