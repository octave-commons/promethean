import sys
import asyncio
import base64

from shared.py.service_template import run_service
from shared.py.speech.wisper_stt import transcribe_pcm



async def process_task(client, task):

    payload = task.get("payload", {})
    pcm_b64 = payload.get("pcm")
    sample_rate = payload.get("sample_rate", 16000)
    if pcm_b64 is None:
        print("[stt] task missing 'pcm' field")
        return
    pcm_bytes = base64.b64decode(pcm_b64)
    from shared.py.speech import wisper_stt as _wisper

    text = _wisper.transcribe_pcm(bytearray(pcm_bytes), sample_rate)
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
