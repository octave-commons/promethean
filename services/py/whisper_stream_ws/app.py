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
async def stream(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            global streamer
            if streamer is None:
                streamer = WhisperStreamer()
            data = await ws.receive_bytes()
            text = next(streamer.transcribe_chunks([data]))
            await ws.send_json({"transcription": text})
    except WebSocketDisconnect:
        pass
    finally:
        if not ws.client_state.name == "CLOSED":
            await ws.close()
