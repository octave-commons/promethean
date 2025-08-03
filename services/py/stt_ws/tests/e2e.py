import services.stt_ws.app as stt_app
import base64
import pytest
import websockets
import uvicorn
from threading import Thread
import asyncio
import json
import sys

async def start_server(app, port):
    config = uvicorn.Config(app, host='127.0.0.1', port=port, log_level='warning')
    server = uvicorn.Server(config)
    thread = Thread(target=server.run, daemon=True)
    thread.start()
    # wait for startup
    while not server.started:
        await asyncio.sleep(0.05)
    return server, thread


async def stop_server(server, thread):
    server.should_exit = True
    thread.join()
@pytest.mark.asyncio
async def test_stt_ws_end_to_end(monkeypatch):
    monkeypatch.setitem(sys.modules, 'shared.py.speech.wisper_stt',
                        type('M', (), {'transcribe_pcm': lambda pcm, sr: 'ok'}))
    server, thread = await start_server(stt_app.app, 5050)
    try:
        uri = 'ws://127.0.0.1:5050/transcribe'
        async with websockets.connect(uri) as ws:
            data = base64.b64encode(b'ab').decode()
            await ws.send(json.dumps({'pcm': data, 'sample_rate': 16000}))
            msg = await ws.recv()
            assert json.loads(msg)['transcription'] == 'ok'
    finally:
        await stop_server(server, thread)
