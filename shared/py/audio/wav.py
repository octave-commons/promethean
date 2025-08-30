import torch
import torch.nn.functional as F
import numpy as np
import wave
import io
import discord

from scipy.signal import resample_poly


def split_waveform_into_batches(
    waveform: torch.Tensor, chunk_size: int = 320000
) -> list:
    """
    Splits a waveform tensor into chunks of `chunk_size` samples, padding the last chunk if needed.

    Args:
        waveform (torch.Tensor): Shape [channels, samples], typically [1, N]
        chunk_size (int): Number of samples per chunk

    Returns:
        List[torch.Tensor]: List of [channels, chunk_size] tensors
    """
    if waveform.dim() != 2:
        raise ValueError("Expected waveform of shape [channels, samples]")

    channels, total_samples = waveform.shape
    chunks = []

    for start in range(0, total_samples, chunk_size):
        end = start + chunk_size
        chunk = waveform[:, start:end]

        if chunk.shape[1] < chunk_size:
            pad_amount = chunk_size - chunk.shape[1]
            chunk = F.pad(chunk, (0, pad_amount), mode="constant", value=0)

        chunks.append(chunk)

    return chunks


def normalize_audio(wav_data: np.ndarray) -> np.ndarray:
    """Ensure waveform is in [-1.0, 1.0] without clipping."""
    max_val = np.max(np.abs(wav_data))
    if max_val == 0:
        return wav_data
    return wav_data / max_val


def upsample_and_stereo(
    wav_data: np.ndarray, orig_sr: int = 22050, target_sr: int = 48000
) -> np.ndarray:
    """Resample from orig_sr to target_sr and convert to stereo."""
    # Normalize
    wav_data = normalize_audio(wav_data)

    # Resample using high-quality polyphase filter
    upsampled = resample_poly(wav_data, target_sr, orig_sr)

    # Stereo conversion (duplicate mono channel)
    stereo = np.stack([upsampled, upsampled], axis=1).astype(np.float32)

    return stereo


def upsample_to_stream(
    wav_data: np.ndarray, orig_sr: int = 22050, target_sr: int = 48000
):
    # Convert float32 [-1.0, 1.0] to int16
    int16_data = np.clip(
        upsample_and_stereo(wav_data, orig_sr, target_sr) * 32767, -32768, 32767
    ).astype(np.int16)

    # Write to a WAV buffer
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)  # 2 bytes for int16
        wf.setframerate(48000)
        wf.writeframes(int16_data.tobytes())
    wav_buffer.seek(0)
    return wav_buffer
