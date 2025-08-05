from fastapi import FastAPI, Form, Response, WebSocket
import io
import sys

print(sys.path)
from shared.py.heartbeat_client import HeartbeatClient
from shared.py.utils import websocket_endpoint

from safetensors.torch import load_file

import soundfile as sf

import nltk
import soundfile as sf
import torch
import numpy as np
import os
from transformers import FastSpeech2ConformerTokenizer, FastSpeech2ConformerWithHifiGan

nltk.download("averaged_perceptron_tagger_eng")

app = FastAPI()
hb = HeartbeatClient()


@app.on_event("startup")
async def startup_event():
    try:
        hb.send_once()
    except Exception as exc:
        raise RuntimeError("heartbeat registration failed") from exc
    hb.start()


@app.on_event("shutdown")
def shutdown_event():
    hb.stop()


# Load the model and processor
from transformers import (
    FastSpeech2ConformerTokenizer,
    FastSpeech2ConformerWithHifiGan,
)
import torch

# Ensure GPU usage
device = "cuda" if torch.cuda.is_available() else "cpu"
print("Running on device", device)

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
