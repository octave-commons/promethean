from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import io
import soundfile as sf

app = FastAPI()


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
