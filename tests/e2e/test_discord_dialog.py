import asyncio
import os
import sys
import types
from threading import Thread

import httpx
import numpy as np
import pytest
import uvicorn
import websockets

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))


async def start_server(app, port):
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    thread = Thread(target=server.run, daemon=True)
    thread.start()
    while not server.started:
        await asyncio.sleep(0.05)
    return server, thread


async def stop_server(server, thread):
    server.should_exit = True
    thread.join()


def stub_transcribe_pcm(_pcm: bytes, _sr: int) -> str:
    return "hi"


def stub_generate_voice(_text: str) -> np.ndarray:
    return np.zeros(22050, dtype=np.float32)


def fake_llm(text: str) -> str:
    return f"LLM:{text}"


@pytest.mark.asyncio
async def test_discord_dialog_flow(monkeypatch):
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.wisper_stt",
        types.SimpleNamespace(transcribe_pcm=stub_transcribe_pcm),
    )
    dummy_module = types.SimpleNamespace(generate_voice=stub_generate_voice)
    monkeypatch.setitem(sys.modules, "speech", types.SimpleNamespace(tts=dummy_module))
    monkeypatch.setitem(sys.modules, "speech.tts", dummy_module)
    monkeypatch.setitem(sys.modules, "shared.py.speech", types.SimpleNamespace(tts=dummy_module))
    monkeypatch.setitem(sys.modules, "shared.py.speech.tts", dummy_module)

    from services.py.stt import app as stt_app
    from services.py.tts import ws as tts_ws

    stt_server, stt_thread = await start_server(stt_app.app, 5061)
    tts_server, tts_thread = await start_server(tts_ws.app, 5062)

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "http://127.0.0.1:5061/transcribe_pcm",
                headers={"X-Sample-Rate": "16000", "X-Dtype": "int16"},
                content=b"pcm",
            )
        text = resp.json()["transcription"]
        reply = fake_llm(text)

        uri = "ws://127.0.0.1:5062/ws/tts"
        async with websockets.connect(uri) as ws:
            await ws.send(reply)
            audio = await ws.recv()
        assert audio.startswith(b"RIFF")
    finally:
        await stop_server(stt_server, stt_thread)
        await stop_server(tts_server, tts_thread)
