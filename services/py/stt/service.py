import sys

sys.path.append("../../../")

import asyncio
import base64

from shared.py.service_template import start_service
from shared.py.heartbeat_client import HeartbeatClient


async def process_task(client, task):
    from shared.py.speech.wisper_stt import transcribe_pcm

    payload = task.get("payload", {})
    pcm_b64 = payload.get("pcm")
    sample_rate = payload.get("sample_rate", 16000)
    if pcm_b64 is None:
        print("[stt] task missing 'pcm' field")
        return
    pcm_bytes = base64.b64decode(pcm_b64)
    text = transcribe_pcm(bytearray(pcm_bytes), sample_rate)
    await client.publish("stt.transcribed", {"text": text}, correlationId=task["id"])


async def main():
    hb = HeartbeatClient()
    try:
        hb.send_once()
    except (
        Exception
    ) as exc:  # pragma: no cover - heartbeat failures shouldn't crash service
        raise RuntimeError("heartbeat registration failed") from exc
    hb.start()

    client_holder = {}

    async def handle_task(task, client):
        await process_task(client_holder["client"], task)

    client_holder["client"] = await start_service(
        id="stt",
        queues=["stt.transcribe"],
        handle_task=handle_task,
    )

    try:
        await asyncio.Event().wait()
    finally:
        hb.stop()


if __name__ == "__main__":
    asyncio.run(main())
