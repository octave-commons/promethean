import sys
import numpy as np
import soundfile as sf
from openvino import Core
from lib.models.forward_tacotron_ie import ForwardTacotronIE
from lib.models.mel2wave_ie import WaveRNNIE
from time import perf_counter
from lib.utils.split_sentences import split_sentences
import re
import os

# Setup
core = Core()
device = "NPU"
# === Load models ===
print("loading forward tacotron")
forward_tacotron = ForwardTacotronIE(
    os.path.abspath("models/public/forward-tacotron/forward-tacotron-duration-prediction/FP16/forward-tacotron-duration-prediction.xml"),
    os.path.abspath("models/public/forward-tacotron/forward-tacotron-regression/FP16/forward-tacotron-regression.xml"),
    core,
    device,
)
print("loading wavrnn")

vocoder = WaveRNNIE(
    os.path.abspath("models/public/wavernn/wavernn-upsampler/FP16/wavernn-upsampler.xml"),
    os.path.abspath("models/public/wavernn/wavernn-rnn/FP16/wavernn-rnn.xml"),
    core,
    device=device,
    upsampler_width=512,  # Adjust as needed
    target=1000,  # Adjust as needed
    # target=200,
    # overlap=50
)

# === Inference Pipeline ===
input_text = """hello world, testing long input? let's try more, How are you? How is your day going, how is the weather today? This is a test of the text to speech system, it should handle multiple sentences and punctuation marks correctly. Let's see how it performs with longer sentences and various punctuation!

We're gonna add a new line in to see how it handles that. The quick brown fox jumps over the lazy dog.

This is a longer sentence to test the splitting functionality.

It should be split into multiple chunks if it exceeds the maximum length.

Let's see how it works with punctuation, like commas, periods, and question marks!
Also, let's add some more text to ensure we hit the max length limit.
This should help us verify that the sentence splitting works as expected.

We need a really really really long sentance without any punctuation marks to test the word level splitting correctly hopefully this will work out well and we can see how the system handles it without any breaks or pauses in the text.
"""
print("generating voice audio file")
chunks = split_sentences(input_text)
all_audio = []
time_all_start=perf_counter()
for chunk in chunks:
    time_chunk_start=perf_counter()
    if not chunk:
        continue
    # print(f"Processing chunk: '{chunk}'")
    mel = forward_tacotron.forward(chunk.strip(), alpha=1.0)
    audio = vocoder.forward(mel)
    all_audio.append(audio)
    time_chunk_end = perf_counter()
    # print(f"Processed chunk in {time_chunk_end - time_chunk_start:.2f} seconds, audio length: {len(audio)} samples")
final_audio = np.concatenate(all_audio)
time_all_end = perf_counter()
print(f"Processed all chunks in {time_all_end - time_all_start:.2f} seconds, total audio length: {len(final_audio)} samples")

# === Save output ===
sf.write("output.wav", final_audio, 22050)
print("Audio saved to output.wav")
