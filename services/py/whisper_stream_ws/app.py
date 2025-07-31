from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from shared.py.speech.whisper_stream import WhisperStreamer

app = FastAPI()
streamer = None

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
