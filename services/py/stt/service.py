import sys

sys.path.append("../../../")

import asyncio
import base64

from shared.py.service_template import start_service


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
