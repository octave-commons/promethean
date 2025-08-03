import hy
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
