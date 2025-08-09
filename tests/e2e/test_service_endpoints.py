import asyncio
import httpx
import pytest


async def _post_json(url, **kwargs):
    async with httpx.AsyncClient(timeout=30.0) as client:
        return await client.post(url, **kwargs)


async def _get(url, **kwargs):
    async with httpx.AsyncClient(timeout=30.0) as client:
        return await client.get(url, **kwargs)


def test_tts_synth_voice_pcm():
    async def _run():
        return await _post_json(
            "http://127.0.0.1:5001/synth_voice_pcm", data={"input_text": "hello"}
        )

    try:
        resp = asyncio.run(_run())
    except Exception:
        pytest.skip("tts service not running")
    assert resp.status_code == 200
    assert resp.headers.get("content-type") == "application/octet-stream"
    assert len(resp.content) > 0


def test_stt_transcribe_pcm():
    pcm = b"\x00\x00" * 16000

    async def _run():
        return await _post_json(
            "http://127.0.0.1:5002/transcribe_pcm",
            headers={"X-Sample-Rate": "16000", "X-Dtype": "int16"},
            content=pcm,
        )

    try:
        resp = asyncio.run(_run())
    except Exception:
        pytest.skip("stt service not running")
    assert resp.status_code == 200
    data = resp.json()
    assert "transcription" in data
    assert isinstance(data["transcription"], str)


def test_vision_capture_endpoint():
    async def _run():
        return await _get("http://127.0.0.1:9999/capture")

    try:
        resp = asyncio.run(_run())
    except Exception:
        pytest.skip("vision service not running")
    assert resp.status_code == 200
    assert resp.headers.get("content-type") == "image/png"
    assert len(resp.content) > 0


def test_llm_generate_endpoint():
    payload = {"prompt": "hi", "context": [], "format": None}

    async def _run():
        return await _post_json("http://127.0.0.1:8888/generate", json=payload)

    try:
        resp = asyncio.run(_run())
    except Exception:
        pytest.skip("llm service not running")
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    assert isinstance(data["reply"], str)
