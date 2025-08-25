from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
import torchaudio
import time
import numpy as np

# Confirm GPU availability
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# Load small model
processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
# The 2024 Transformers release deprecated relying on ``forced_decoder_ids``
# defaults for Whisper.  Explicitly set the generation task and language to
# avoid warnings and make behaviour deterministic.
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny").to(
    device
)
model.generation_config.task = "transcribe"
model.generation_config.language = "en"


def resample_waveform(
    waveform: torch.Tensor, orig_freq: int, new_freq: int
) -> torch.Tensor:
    """
    Resamples a waveform tensor to a new frequency.

    Args:
        waveform (torch.Tensor): Input waveform tensor of shape [channels, samples].
        orig_freq (int): Original sampling freq
        new_freq (int): Desired sampling frequency.

    Returns:
        torch.Tensor: Resampled waveform tensor.
    """
    return torchaudio.transforms.Resample(orig_freq=orig_freq, new_freq=new_freq)(
        waveform
    )


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


def transcribe_pcm(
    pcm_data: bytearray,
    sample_rate: int = 48000,
    num_channels: int = 2,
    # chunk_size: int = max_wave_len
):
    """
    Transcribes raw 16-bit PCM audio data (mono or stereo).
    """
    return transcribe(
        waveform=get_waveform_from_bytes(
            pcm_data, sample_rate=sample_rate, num_channels=num_channels
        ),
        sample_rate=sample_rate,
        # chunk_size=chunk_size
    )


def transcribe(waveform, sample_rate):

    # Process inputs
    start = time.perf_counter()
    if waveform.numel() < 320:  # Less than 20ms at 16kHz
        return ""  # or return "", or skip processing entirely
    inputs = processor(
        waveform.squeeze().float().cpu().numpy(),  # force float32, detach from graph
        sampling_rate=16000,
        return_tensors="pt",
    ).to(device)

    # Generate transcription
    with torch.no_grad():
        generated_ids = model.generate(inputs["input_features"])

    # Decode and time
    print("Done in", time.perf_counter() - start, "seconds")
    return processor.batch_decode(generated_ids, skip_special_tokens=True)[0]


import numpy as np
