from fastapi import FastAPI, WebSocket
import io
import soundfile as sf

from shared.py.utils import websocket_endpoint

app = FastAPI()


@app.websocket("/ws/tts")
@websocket_endpoint
async def tts_websocket(ws: WebSocket):
    from shared.py.speech import tts

    while True:
        text = await ws.receive_text()
        audio = tts.generate_voice(text)
        buf = io.BytesIO()
        sf.write(buf, audio, samplerate=22050, format="WAV")
        await ws.send_bytes(buf.getvalue())
