from fastapi import (
    FastAPI,
    Request,
    Header,
    Query,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import JSONResponse
from starlette.websockets import WebSocketState

import asyncio
import base64
import json
import sys

sys.path.append("../../../")
from shared.py.speech.wisper_stt import transcribe_pcm
from shared.py.speech.whisper_stream import WhisperStreamer
from shared.py.utils import websocket_endpoint
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


@app.post("/transcribe_pcm")
async def transcribe_pcm_endpoint(
    request: Request, x_sample_rate: int = Header(16000), x_dtype: str = Header("int16")
):
    if x_dtype != "int16":
        return JSONResponse(
            {"error": "Only int16 PCM supported for now"}, status_code=400
        )

    pcm_data = bytearray()
    async for chunk in request.stream():
        pcm_data.extend(chunk)

    # Now call your transcription logic
    transcription = transcribe_pcm(pcm_data, x_sample_rate)
    # print("final transcription", transcription)
    return {"transcription": transcription}


@app.websocket("/transcribe")
@websocket_endpoint
async def transcribe_ws(ws: WebSocket):
    try:
        msg = await ws.receive_text()
        payload = json.loads(msg)
        pcm_b64 = payload.get("pcm")
        if pcm_b64 is None:
            await ws.close(code=1003)
            return
        sample_rate = int(payload.get("sample_rate", 16000))
        pcm_bytes = base64.b64decode(pcm_b64)
        text = transcribe_pcm(bytearray(pcm_bytes), sample_rate)
        await ws.send_json({"transcription": text})
    except WebSocketDisconnect:
        pass


@app.websocket("/stream")
@websocket_endpoint
async def stream(ws: WebSocket):
    global streamer
    try:
        while True:
            if streamer is None:
                streamer = WhisperStreamer()
            data = await ws.receive_bytes()
            text = next(streamer.transcribe_chunks([data]))
            await ws.send_json({"transcription": text})
    except WebSocketDisconnect:
        pass
    finally:
        if ws.client_state != WebSocketState.DISCONNECTED:
            await ws.close()
