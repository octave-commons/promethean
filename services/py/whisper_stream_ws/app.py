from fastapi import FastAPI, WebSocket

from shared.py.speech.whisper_stream import WhisperStreamer
from shared.py.utils import websocket_endpoint

app = FastAPI()
streamer = None


@app.websocket("/stream")
@websocket_endpoint
async def stream(ws: WebSocket):
    global streamer
    while True:
        if streamer is None:
            streamer = WhisperStreamer()
        data = await ws.receive_bytes()
        text = next(streamer.transcribe_chunks([data]))
        await ws.send_json({"transcription": text})
