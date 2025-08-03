from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import io
import soundfile as sf
from shared.py.heartbeat_client import HeartbeatClient

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


@app.websocket("/ws/tts")
async def tts_websocket(ws: WebSocket):
    await ws.accept()
    try:
        from shared.py.speech import tts

        while True:
            text = await ws.receive_text()
            audio = tts.generate_voice(text)
            buf = io.BytesIO()
            sf.write(buf, audio, samplerate=22050, format="WAV")
            await ws.send_bytes(buf.getvalue())
    except WebSocketDisconnect:
        pass
    finally:
        await ws.close()
