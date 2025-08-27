from fastapi import FastAPI, Form, Response, WebSocket
import io
import os
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

TOKENIZER = None
MODEL = None
DEVICE = None


def init_tts() -> None:
    """Load tokenizer and model if they haven't been initialized."""
    global TOKENIZER, MODEL, DEVICE
    if TOKENIZER is not None and MODEL is not None:
        return
    skip_downloads = os.environ.get("TTS_SKIP_DOWNLOADS") == "1"
    if not skip_downloads:
        nltk.download("averaged_perceptron_tagger_eng", quiet=True)
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    print("Running on device", DEVICE)
    TOKENIZER = FastSpeech2ConformerTokenizer.from_pretrained(
        "espnet/fastspeech2_conformer", local_files_only=skip_downloads
    )
    MODEL = FastSpeech2ConformerWithHifiGan.from_pretrained(
        "espnet/fastspeech2_conformer_with_hifigan",
        use_safetensors=True,
        local_files_only=skip_downloads,
    ).to(DEVICE)


app = FastAPI()
broker = None


@app.on_event("startup")
async def startup_event():
    global broker
    init_tts()

    async def handle_task(task):
        payload = task.get("payload", {})
        text = payload.get("text")
        if not text:
            return
        audio = synthesize(text)
        audio_b64 = wav_to_base64(audio, 22050)
        await broker.publish("tts-output", {"audio": audio_b64})

    try:
        broker = await start_service(
            id="tts", queues=["tts.speak"], handle_task=handle_task
        )
    except Exception as e:
        print(f"[tts] broker connection failed: {e}")
        broker = None


@app.on_event("shutdown")
def shutdown_event():
    pass


def synthesize(text: str) -> np.ndarray:
    """Generate a waveform for the provided text."""
    init_tts()
    input_ids = TOKENIZER(text, return_tensors="pt").input_ids.to(DEVICE)
    with torch.no_grad():
        output = MODEL(input_ids, return_dict=True)
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
