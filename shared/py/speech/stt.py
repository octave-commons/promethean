import torch
import torchaudio
import torch
import numpy as np
import struct

from scipy.ndimage import uniform_filter1d
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

import openvino as ov
import io

# Load pre-trained model
model = Wav2Vec2ForCTC.from_pretrained("jonatasgrosman/wav2vec2-large-xlsr-53-english")
processor = Wav2Vec2Processor.from_pretrained(
    "jonatasgrosman/wav2vec2-large-xlsr-53-english"
)


def debug_waveform(name="waveform"):
    def wrapper(waveform):
        print(f"{name} shape: {waveform.shape}")
        print(f"{name} dtype: {waveform.dtype}")
        print(f"{name} max: {waveform.max().item()}")
        print(f"{name} min: {waveform.min().item()}")
        print(f"{name} mean: {waveform.mean().item()}")
        return waveform

    return wrapper


# Load audio data
example_waveform, sample_rate = torchaudio.load("Recording.wav")

example_input = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)(
    example_waveform
)
print("waveform resampled shape", example_input.shape)

ov_model = ov.convert_model(model, example_input=example_input)
# Manually set upper bounds (batch=2, channels=1, max length=300000)
input_tensor = ov_model.inputs[0]
partial_shape = input_tensor.get_partial_shape()

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

gec_tokenizer = AutoTokenizer.from_pretrained("unbabel/gec-t5_small")
gec_model = AutoModelForSeq2SeqLM.from_pretrained("unbabel/gec-t5_small")


def spell_check(text):
    inputs = gec_tokenizer("gec: " + text, return_tensors="pt")
    outputs = gec_model.generate(
        input_ids=inputs.input_ids,
        attention_mask=inputs.attention_mask,
        max_length=len(text),
        num_beams=5,
        early_stopping=True,
    )
    return gec_tokenizer.decode(outputs[0], skip_special_tokens=True)


# Set an upper bound for the dynamic dimension
max_wave_len = 320000  # this must be longer than your longest input
ov_model.reshape({ov_model.inputs[0]: ov.PartialShape([1, max_wave_len])})
compiled_model = ov.compile_model(ov_model, device_name="NPU")


def pad_waveforms(waveforms, target_length=None):
    """
    Pads a list of 1D torch tensors to the same length.
    Returns padded tensor [B, T] and the original lengths.
    """
    lengths = [w.shape[-1] for w in waveforms]
    max_len = target_length or max(lengths)
    padded = torch.stack(
        [
            torch.nn.functional.pad(w.squeeze(0), (0, max_len - w.shape[-1]))
            for w in waveforms
        ]
    )
    return padded, lengths


def resample_waveform(
    waveform: torch.Tensor, orig_freq: int, new_freq: int
) -> torch.Tensor:
    """
    Resamples a waveform tensor to a new frequency.

    Args:
        waveform (torch.Tensor): Input waveform tensor of shape [channels, samples].
        orig_freq (int): Original sampling frequency.
        new_freq (int): Desired sampling frequency.

    Returns:
        torch.Tensor: Resampled waveform tensor.
    """
    return torchaudio.transforms.Resample(orig_freq=orig_freq, new_freq=new_freq)(
        waveform
    )


from scipy.signal import sosfilt, sosfiltfilt, butter


def clamp_freq(freq: float, sample_rate: int) -> float:
    """Clamp frequency to be strictly within 0 < f < Nyquist"""
    nyquist = sample_rate / 2
    return max(1.0, min(freq, nyquist - 1.0))  # at least 1Hz, at most Nyquist-1Hz


def equalize_voice(
    audio: np.ndarray,
    sample_rate: int = 16000,
    highpass: int = 80,
    lowpass: int = 8000,
    notch1: tuple[int, int] = (200, 300),
    notch2: tuple[int, int] = (500, 800),
) -> np.ndarray:
    if audio.ndim != 1:
        raise ValueError("Expected mono audio")

    nyquist = sample_rate / 2
    sos_chain = []

    # High-pass
    hp = clamp_freq(highpass, sample_rate)
    if hp < nyquist:
        sos_chain.append(butter(2, hp / nyquist, btype="highpass", output="sos"))

    # Notch filters
    for notch in [notch1, notch2]:
        if notch:
            f1, f2 = clamp_freq(notch[0], sample_rate), clamp_freq(
                notch[1], sample_rate
            )
            if f2 > f1:
                sos_chain.append(
                    butter(
                        2, [f1 / nyquist, f2 / nyquist], btype="bandstop", output="sos"
                    )
                )

    # Low-pass
    lp = clamp_freq(lowpass, sample_rate)
    if lp > 1.0:
        sos_chain.append(butter(2, lp / nyquist, btype="lowpass", output="sos"))

    # Apply filters
    out = audio.copy()
    for sos in sos_chain:
        out = sosfiltfilt(sos, out)

    return np.clip(out, -1.0, 1.0)


def cleanup_audio_buffer(
    pcm_data: bytearray,
    sample_rate: int = 48000,
    num_channels: int = 2,
    silence_threshold: float = 0.01,
    silence_duration_sec: float = 0.3,
    min_chunk_duration_sec: float = 0.5,
) -> list[np.ndarray]:
    """
    Cleans up raw PCM audio:
    - Converts to mono float32
    - Detects and splits at silence
    - Removes segments that are just noise or silence

    Returns a list of np.ndarray audio chunks, float32, mono, sample_rate
    """
    # Convert bytes to int16 samples

    # Normalize to [-1.0, 1.0]
    audio_np = equalize_voice(
        np.frombuffer(pcm_data, dtype=np.int16) / 32768.0, sample_rate=sample_rate
    )

    # Reshape for stereo → (samples, channels)
    if num_channels > 1:
        audio_np = audio_np.reshape((-1, num_channels))
        # Convert to mono by averaging channels
        audio_np = audio_np.mean(axis=1)

    # Compute frame-wise energy (RMS over short window)
    frame_size = int(sample_rate * 0.02)  # 20 ms
    energy = np.sqrt(uniform_filter1d(audio_np**2, size=frame_size))

    # Determine silent regions
    silence_mask = energy < silence_threshold
    silence_samples = int(silence_duration_sec * sample_rate)

    # Find split points: long stretches of silence
    silent_indices = np.flatnonzero(silence_mask)
    split_points = []
    i = 0
    while i < len(silent_indices):
        start = silent_indices[i]
        count = 1
        while (
            i + count < len(silent_indices)
            and silent_indices[i + count] == silent_indices[i] + count
        ):
            count += 1
        if count >= silence_samples:
            split_points.append(silent_indices[i])
            i += count
        else:
            i += 1

    # Split into chunks
    split_points = [0] + split_points + [len(audio_np)]
    chunks = []
    for i in range(len(split_points) - 1):
        chunk = audio_np[split_points[i] : split_points[i + 1]]
        if len(chunk) >= min_chunk_duration_sec * sample_rate:
            chunks.append(chunk)

    return chunks


def transcribe_chunk(waveform: torch.Tensor, chunk_size: int = max_wave_len) -> str:
    print("Waveform shape:", waveform.shape)
    print("Max amplitude:", waveform.max().item())
    print("Min amplitude:", waveform.min().item())

    padded, _ = pad_waveforms([waveform], chunk_size)

    ov_out = compiled_model([padded])
    logits = torch.tensor(ov_out["logits"])
    predicted_ids = torch.argmax(logits, dim=-1)
    return processor.batch_decode(predicted_ids)[0]


def transcribe(waveform: torch.Tensor, chunk_size: int = max_wave_len) -> str:
    """
    Transcribes a long audio file by splitting it into smaller chunks.
    """
    batches = [
        waveform[:, i : i + chunk_size] for i in range(0, waveform.size(1), chunk_size)
    ]
    results = []
    print("batches", batches)
    for batch in batches:
        transcription = transcribe_chunk(batch)
        results.append(
            transcription[0] if isinstance(transcription, list) else transcription
        )
    print("transcription results:", results)
    return " ".join(results)


import numpy as np


def convert_to_mono_np(audio: np.ndarray) -> np.ndarray:
    """
    Converts multi-channel NumPy audio to mono.
    Accepts audio in shape [samples, channels] or [channels, samples].

    Returns shape: [samples]
    """
    if audio.ndim == 1:
        return audio  # already mono

    if audio.shape[0] < audio.shape[1]:  # likely [channels, samples]
        return audio.mean(axis=0)
    else:  # likely [samples, channels]
        return audio.mean(axis=1)


import torch


def convert_to_mono_tensor(waveform: torch.Tensor) -> torch.Tensor:
    """
    Converts multi-channel PyTorch waveform to mono.
    Accepts tensor of shape [channels, samples] or [samples, channels].

    Returns shape: [1, samples]
    """
    if waveform.ndim == 1:
        return waveform.unsqueeze(0)  # [1, T]

    if waveform.shape[0] < waveform.shape[1]:  # assume [C, T]
        return waveform.mean(dim=0, keepdim=True)  # [1, T]
    else:  # assume [T, C]
        return waveform.mean(dim=1, keepdim=True).T  # transpose to [1, T]


from typing import Union


def convert_to_mono(
    audio: Union[np.ndarray, torch.Tensor],
) -> Union[np.ndarray, torch.Tensor]:
    if isinstance(audio, np.ndarray):
        return convert_to_mono_np(audio)
    elif isinstance(audio, torch.Tensor):
        return convert_to_mono_tensor(audio)
    else:
        raise TypeError("Unsupported audio type. Expected np.ndarray or torch.Tensor.")


def get_waveform_from_bytes(
    pcm_data: bytearray, sample_rate: int = 48000, num_channels: int = 2
) -> torch.Tensor:
    """
    Converts raw PCM bytes to mono waveform tensor at 16kHz.
    Returns: torch.Tensor of shape [1, T], dtype float32, range [-1.0, 1.0]
    """
    audio_int16 = np.frombuffer(pcm_data, dtype=np.int16)

    if len(audio_int16) % num_channels != 0:
        raise ValueError("PCM data size is not divisible by number of channels")

    # Reshape and convert to float32
    audio_int16 = audio_int16.reshape(-1, num_channels).T  # [C, T]
    waveform = torch.from_numpy(
        np.clip(audio_int16.astype(np.float32) / 32768.0, -1.0, 1.0)
    )  # [C, T]
    mono_waveform = convert_to_mono_tensor(waveform)
    # Resample to 16kHz
    resampled = resample_waveform(mono_waveform, orig_freq=sample_rate, new_freq=16000)
    return resampled


def get_np_from_bytes(
    pcm_data: bytearray, sample_rate: int = 48000, num_channels: int = 2
) -> np.ndarray:
    """
    Converts raw PCM audio data to a 1D tensor.
    """
    return get_waveform_from_bytes(
        pcm_data, sample_rate=sample_rate, num_channels=num_channels
    ).numpy()


from symspellpy.symspellpy import SymSpell, Verbosity

# Create object with max edit distance of 2
sym_spell = SymSpell(max_dictionary_edit_distance=2)

# Load frequency dictionary (download from SymSpell repo)
# sym_spell.load_dictionary("frequency_dictionary_en_82_765.txt", 0, 1)

# # Spell correction example
# input_text = "I havv goood speling"
# suggestions =


# print(suggestions[0].term)  # "I have good spelling"
def transcribe_pcm(
    pcm_data: bytearray,
    sample_rate: int = 48000,
    num_channels: int = 2,
    chunk_size: int = max_wave_len,
):
    """
    Transcribes raw 16-bit PCM audio data (mono or stereo).
    """
    return spell_check(
        transcribe(
            waveform=get_waveform_from_bytes(
                pcm_data, sample_rate=sample_rate, num_channels=num_channels
            ),
            chunk_size=chunk_size,
        )
    )


def equalize_and_transcribe_pcm(
    pcm_data: bytearray,
    sample_rate: int = 48000,
    num_channels: int = 2,
    chunk_size: int = max_wave_len,
    highpass: int = 80,
    lowpass: int = 8000,
    notch1: tuple[int, int] = (200, 300),
    notch2: tuple[int, int] = (500, 800),
) -> str:
    """
    Applies EQ to raw PCM audio and transcribes it.
    """
    waveform = get_waveform_from_bytes(
        pcm_data, sample_rate=sample_rate, num_channels=num_channels
    )  # shape: [1, T], float32

    # Convert to flat mono NumPy array
    mono_np = waveform.squeeze().numpy()

    # Equalize
    eq_np = equalize_voice(
        mono_np,
        sample_rate=16000,
        highpass=highpass,
        lowpass=lowpass,
        notch1=notch1,
        notch2=notch2,
    )

    # Convert back to torch for transcription, add batch dim again
    eq_tensor = torch.from_numpy(eq_np).unsqueeze(0)  # shape: [1, T]

    return transcribe(eq_tensor, chunk_size=chunk_size)


def process_and_transcribe_pcm(
    pcm_data: bytearray,
    sample_rate: int = 48000,
    num_channels: int = 2,
    chunk_size: int = max_wave_len,
) -> str:
    """
    Transcribes raw 16-bit PCM audio data (mono or stereo).
    Args:
        pcm_data (bytes): Raw PCM audio data.
        sample_rate (int): Sampling rate of the audio.
        num_channels (int): Number of audio channels (1=mono, 2=stereo).
        chunk_size (int): Size of each chunk for processing.
    Returns:
        str: Transcription of the audio.
    """
    # Convert raw bytes to 1D int16 tensor
    cleaned_chunks = cleanup_audio_buffer(
        pcm_data, sample_rate=sample_rate, num_channels=num_channels
    )
    # waveform = torch.frombuffer(pcm_data, dtype=torch.int16).float() / 32768.0  # Normalize
    waveforms = []
    for chunk in cleaned_chunks:
        # waveform = torch.from_numpy(chunk).unsqueeze(0)  # [1, T]
        # Optional: Downmix to mono if your model expects mono input
        waveform = torch.from_numpy(chunk).unsqueeze(0)  # shape: [1, T]
        waveforms.append(waveform)

    return "... ".join(
        [transcribe_chunk(waveform, chunk_size) for waveform in waveforms]
    )
