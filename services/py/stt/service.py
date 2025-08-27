import sys
import asyncio

from shared.py.speech.audio_utils import pcm_from_base64
from shared.py.service_template import run_service


async def process_task(client, task):

    payload = task.get("payload", {})
    pcm_b64 = payload.get("pcm")
    sample_rate = payload.get("sample_rate", 16000)
    if pcm_b64 is None:
        print("[stt] task missing 'pcm' field")
        return
    pcm_bytes = pcm_from_base64(pcm_b64)
    # Import inside the function so tests can monkeypatch sys.modules
    from shared.py.speech.wisper_stt import transcribe_pcm as _transcribe_pcm

    text = _transcribe_pcm(pcm_bytes, sample_rate)
    await client.publish("stt.transcribed", {"text": text}, correlationId=task["id"])


async def handle_task(task, client):
    await process_task(client, task)


if __name__ == "__main__":
    asyncio.run(
        run_service(
            id="stt",
            queues=["stt.transcribe"],
            handle_task=handle_task,
        )
    )
