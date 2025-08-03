from fastapi import FastAPI, Form, Response
import torch
import io

from safetensors.torch import load_file

import soundfile as sf
import nltk

nltk.download("averaged_perceptron_tagger_eng")


# from huggingface_hub import hf_hub_download
# print(hf_hub_download(repo_id="facebook/fastspeech2-en-ljspeech", filename="vocab.txt", cache_dir=None, local_files_only=True))

app = FastAPI()

# Load the model and processor
from transformers import (
    FastSpeech2ConformerTokenizer,
    FastSpeech2ConformerWithHifiGan,
)
import torch

# Ensure GPU usage
device = "cuda" if torch.cuda.is_available() else "cpu"
print("Running on device", device)

# Load tokenizer and model
tokenizer = FastSpeech2ConformerTokenizer.from_pretrained(
    "espnet/fastspeech2_conformer"
)
model = FastSpeech2ConformerWithHifiGan.from_pretrained(
    "espnet/fastspeech2_conformer_with_hifigan", use_safetensors=True
).to(device)


# Generate waveform
def synthesize(text: str):
    input_ids = tokenizer(text, return_tensors="pt").input_ids.to(device)
    with torch.no_grad():
        output = model(input_ids, return_dict=True)
        return output.waveform.squeeze().cpu().numpy()


@app.post("/synth_voice_pcm")
def synth_voice_pcm(input_text: str = Form(...)):

    # Resample to 22050Hz mono using soundfile (which auto-downsamples)
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
