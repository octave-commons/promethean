from fastapi import FastAPI, Form, Response
import io
import nltk
import soundfile as sf
import torch
import numpy as np
from transformers import FastSpeech2ConformerTokenizer, FastSpeech2ConformerWithHifiGan

nltk.download("averaged_perceptron_tagger_eng")

app = FastAPI()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
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
