from contextlib import asynccontextmanager
import io
import logging

from fastapi import FastAPI, Form, Response, WebSocket
from shared.py.service_template import start_service
from shared.py.speech.audio_utils import wav_to_base64
from shared.py.utils import websocket_endpoint

import soundfile as sf

import nltk
import torch
import numpy as np
from transformers import (
    FastSpeech2ConformerTokenizer,
    FastSpeech2ConformerWithHifiGan,
)

logger = logging.getLogger(__name__)

nltk.download("averaged_perceptron_tagger_eng")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to the message broker on startup and clean up on shutdown."""

    async def handle_task(task, client):
        """Publish synthesized audio for tasks received from the broker."""
        payload = task.get("payload", {})
        text = payload.get("text")
        if not text:
            return
        audio = synthesize(text)
        audio_b64 = wav_to_base64(audio, 22050)
        await client.publish("tts-output", {"audio": audio_b64})

    broker = None
    try:
        broker = await start_service(
            id="tts", queues=["tts.speak"], handle_task=handle_task
        )
    except Exception as e:
        logger.exception("Broker connection failed: %s", e)

    try:
        yield
    finally:
        if broker and getattr(broker, "ws", None):
            await broker.ws.close()


app = FastAPI(lifespan=lifespan)


# Load the model and processor

# Ensure GPU usage
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.debug("Running on device %s", device)

tokenizer = FastSpeech2ConformerTokenizer.from_pretrained(
    "espnet/fastspeech2_conformer"
)
model = FastSpeech2ConformerWithHifiGan.from_pretrained(
    "espnet/fastspeech2_conformer_with_hifigan", use_safetensors=True
).to(device)


def synthesize(text: str) -> np.ndarray:
    """Generate a waveform for the provided text."""
    input_ids = tokenizer(text, return_tensors="pt").input_ids.to(device)
    with torch.no_grad():
        output = model(input_ids, return_dict=True)
        return output.waveform.squeeze().cpu().numpy()


@app.post("/synth_voice_pcm")
def synth_voice_pcm(input_text: str = Form(...)):
    pcm_bytes_io = io.BytesIO()
    sf.write(
        pcm_bytes_io,
        synthesize(input_text),
        samplerate=22050,
        format="RAW",
        subtype="PCM_16",
    )
    return Response(
        content=pcm_bytes_io.getvalue(), media_type="application/octet-stream"
    )


@app.websocket("/ws/tts")
@websocket_endpoint
async def tts_websocket(ws: WebSocket):
    from shared.py.speech import tts

    while True:
        text = await ws.receive_text()
        audio = tts.generate_voice(text)
        buf = io.BytesIO()
        sf.write(buf, audio, samplerate=22050, format="WAV")
        await ws.send_bytes(buf.getvalue())
