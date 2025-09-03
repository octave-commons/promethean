# SPDX-License-Identifier: GPL-3.0-only
import numpy as np
from openvino.runtime import Core
from ..models.forward_tacotron_ie import ForwardTacotronIE
from ..models.mel2wave_ie import WaveRNNIE
from time import perf_counter
from ..utils.split_sentences import split_sentences
from .wav import upsample_to_stream
import re

# Setup
core = Core()
device = "NPU"
# === Load models ===
forward_tacotron = ForwardTacotronIE(
    "models/public/forward-tacotron/forward-tacotron-duration-prediction/FP16/forward-tacotron-duration-prediction.xml",
    "models/public/forward-tacotron/forward-tacotron-regression/FP16/forward-tacotron-regression.xml",
    core,
    device,
)

vocoder = WaveRNNIE(
    "models/public/wavernn/wavernn-upsampler/FP16/wavernn-upsampler.xml",
    "models/public/wavernn/wavernn-rnn/FP16/wavernn-rnn.xml",
    core,
    device=device,
    # upsampler_width=512,  # Adjust as needed
    target=200,
)


def generate_voice(input_text):
    chunks = split_sentences(input_text)
    all_audio = []
    for chunk in chunks:
        if not chunk:
            continue
        mel = forward_tacotron.forward(chunk.strip(), alpha=1.0)
        audio = vocoder.forward(mel)
        all_audio.append(audio)

    final_audio = np.concatenate(all_audio)

    return final_audio


def voice_generator(input_text):
    chunks = split_sentences(input_text)
    for chunk in chunks:
        if not chunk:
            continue
        mel = forward_tacotron.forward(chunk.strip(), alpha=1.0)
        audio = vocoder.forward(mel)
        yield audio.tobytes()


def generate_upsampled_voice_stream(
    input_text, orig_sr: int = 22050, target_sr: int = 48000
):
    return upsample_to_stream(generate_voice(input_text), orig_sr, target_sr)
