import hy
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from shared.py.speech.whisper_stream import WhisperStreamer
from shared.py.heartbeat_client import HeartbeatClient

app = FastAPI()
streamer = None
hb = HeartbeatClient()


@app.on_event("startup")
async def startup_event():
    try:
        hb.send_once()
    except Exception as exc:
        raise RuntimeError("heartbeat registration failed") from exc
    hb.start()


@app.on_event("shutdown")
def shutdown_event():
    hb.stop()


@app.websocket("/stream")
@websocket_endpoint
async def stream(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            global streamer
            if streamer is None:
                streamer = WhisperStreamer()
                _hy_anon_var_1 = None
            else:
                _hy_anon_var_1 = None
            data = await ws.receive_bytes()
            text = next(streamer.transcribe_chunks([data]))
            await ws.send_json({"transcription": text})
        _hy_anon_var_2 = None
    except WebSocketDisconnect:
        _hy_anon_var_2 = None
    finally:
        await ws.close() if not ws.client_state.name == "CLOSED" else None
    return _hy_anon_var_2
