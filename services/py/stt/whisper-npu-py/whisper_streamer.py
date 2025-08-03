
from openvino.runtime import Core
import numpy as np
import torch

core = Core()

import numpy as np
import librosa

def audio_to_mel(audio: np.ndarray, sample_rate=16000, n_fft=400, hop_length=160, n_mels=80, padding=3000):
    # Load mono if stereo
    if audio.ndim > 1:
        audio = np.mean(audio, axis=0)
    if sample_rate != 16000:
        audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=16000)

    # Normalize and pad
    audio = audio / np.max(np.abs(audio))
    audio = np.pad(audio, (0, max(0, 16000*30 - len(audio))))[:16000*30]

    # STFT → Mel → Log
    stft = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length, win_length=n_fft)
    mel_basis = librosa.filters.mel(sr=16000, n_fft=n_fft, n_mels=n_mels)
    mel = mel_basis @ np.abs(stft)
    mel = np.log10(np.maximum(mel, 1e-10))

    # Normalize like Whisper expects
    mel = (mel - mel.mean()) / (mel.std() + 1e-5)
    return mel.astype(np.float32)
from openvino.runtime import Core
import numpy as np

class WhisperStreamer:
    def __init__(self, encoder_path, decoder_path, tokenizer):
        core = Core()
        self.encoder = core.compile_model(core.read_model(encoder_path), "AUTO")
        self.decoder = core.compile_model(core.read_model(decoder_path), "AUTO")

        self.tokenizer = tokenizer  # You can use HuggingFace tokenizer for Whisper
        self.sot_token = tokenizer.bos_token_id
        self.eot_token = tokenizer.eos_token_id

    def transcribe(self, audio):
        mel = audio_to_mel(audio)
        mel = mel[None, :, :3000]  # (1, 80, 3000)

        # Encode
        encoder_output = self.encoder([mel])
        encoded = list(encoder_output.values())[0]

        # Decode
        tokens = [self.sot_token]
        for _ in range(448):  # max length
            decoder_inputs = {
                "tokens": np.array([tokens], dtype=np.int64),
                "encoder_output": encoded,
            }
            decoder_outputs = self.decoder(decoder_inputs)
            logits = list(decoder_outputs.values())[0]
            next_token = int(np.argmax(logits[0, -1]))
            tokens.append(next_token)
            if next_token == self.eot_token:
                break

        return self.tokenizer.decode(tokens[1:-1])
from transformers import WhisperTokenizer

tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-medium")
input_ids = torch.tensor([[tokenizer.bos_token_id]])

model = WhisperStreamer(
    "./whisper-model-npu/whisper_medium_encoder.xml",
    "./whisper-model-npu/whisper_medium_decoder_static_kvcache_224_lm_QKs.xml",
    tokenizer
    )
audio = np.random.randn(16000 * 30).astype(np.float32)  # Simulated 30 seconds of audio
transcription = model.transcribe(audio)
