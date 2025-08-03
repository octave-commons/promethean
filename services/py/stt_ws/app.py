import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from shared.py.heartbeat_client import HeartbeatClient
from shared.py.utils import websocket_endpoint

app = FastAPI()
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


@app.websocket("/transcribe")
@websocket_endpoint
async def transcribe_ws(ws: WebSocket):
    msg = await ws.receive_text()
    payload = json.loads(msg)
    pcm_b64 = payload.get("pcm")
    if pcm_b64 is None:
        await ws.close(code=1003)
        return
    sample_rate = int(payload.get("sample_rate", 16000))
    pcm_bytes = base64.b64decode(pcm_b64)
    from shared.py.speech.wisper_stt import transcribe_pcm

    text = transcribe_pcm(bytearray(pcm_bytes), sample_rate)
    await ws.send_json({"transcription": text})
