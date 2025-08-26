import sys

sys.path.append("../../../")

import asyncio

from shared.py.service_template import start_service
from shared.py.speech.audio_utils import pcm_from_base64
from shared.py.speech.wisper_stt import transcribe_pcm


async def process_task(client, task):

    payload = task.get("payload", {})
    pcm_b64 = payload.get("pcm")
    sample_rate = payload.get("sample_rate", 16000)
    if pcm_b64 is None:
        print("[stt] task missing 'pcm' field")
        return
    pcm_bytes = pcm_from_base64(pcm_b64)
    text = transcribe_pcm(pcm_bytes, sample_rate)
    await client.publish("stt.transcribed", {"text": text}, correlationId=task["id"])


async def main():
    client_holder = {}

    async def handle_task(task, client):
        await process_task(client_holder["client"], task)

    client_holder["client"] = await start_service(
        id="stt",
        queues=["stt.transcribe"],
        handle_task=handle_task,
    )

    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
