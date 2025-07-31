import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect


app = FastAPI()


@app.websocket("/transcribe")
async def transcribe_ws(ws: WebSocket):
    await ws.accept()
    try:
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
    except WebSocketDisconnect:
        pass
    finally:
        if not ws.client_state.name == "CLOSED":
            await ws.close()
