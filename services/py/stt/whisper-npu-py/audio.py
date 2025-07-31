import torch
import time
import librosa
import librosa.display

import numpy as np
import torch.nn.functional as F
import matplotlib.pyplot as plt

from typing import Optional, Union


def pad_or_trim_mel(mel, target_length=3000):
    if mel.shape[1] > target_length:
        print(f"Trimming mel from {mel.shape[1]} frames to {target_length} frames.")
        mel = mel[:, :target_length]
    elif mel.shape[1] < target_length:
        print(f"Padding mel from {mel.shape[1]} frames to {target_length} frames.")
        pad_width = target_length - mel.shape[1]
        mel = np.pad(mel, ((0, 0), (0, pad_width)), mode="constant", constant_values=0)
    return mel


def mel_filters(device, n_mels: int) -> torch.Tensor:
    """
    load the mel filterbank matrix for projecting STFT into a Mel spectrogram.
    Allows decoupling librosa dependency; saved using:

        np.savez_compressed(
            "mel_filters.npz",
            mel_80=librosa.filters.mel(sr=16000, n_fft=400, n_mels=80),
            mel_128=librosa.filters.mel(sr=16000, n_fft=400, n_mels=128),
        )
    """
    assert n_mels in {80, 128}, f"Unsupported n_mels: {n_mels}"

    filters_path = "mel_filters.npz"
    with np.load(filters_path, allow_pickle=False) as f:
        return torch.from_numpy(f[f"mel_{n_mels}"]).to(device)


def log_mel_spectrogram(
    audio: Union[str, np.ndarray, torch.Tensor],
    n_mels: int = 80,
    padding: int = 0,
    device: Optional[Union[str, torch.device]] = None,
):
    """
    Compute the log-Mel spectrogram of

    Parameters
    ----------
    audio: Union[str, np.ndarray, torch.Tensor], shape = (*)
        The path to audio or either a NumPy array or Tensor containing the audio waveform in 16 kHz

    n_mels: int
        The number of Mel-frequency filters, only 80 and 128 are supported

    padding: int
        Number of zero samples to pad to the right

    device: Optional[Union[str, torch.device]]
        If given, the audio tensor is moved to this device before STFT

    Returns
    -------
    torch.Tensor, shape = (n_mels, n_frames)
        A Tensor that contains the Mel spectrogram
    """
    if not torch.is_tensor(audio):
        audio = torch.from_numpy(audio)

    if device is not None:
        audio = audio.to(device)
    if padding > 0:
        audio = F.pad(audio, (0, padding))
    window = torch.hann_window(400).to(audio.device)
    stft = torch.stft(audio, 400, 160, window=window, return_complex=True)
    magnitudes = stft[..., :-1].abs() ** 2

    filters = mel_filters(audio.device, n_mels)
    mel_spec = filters @ magnitudes

    log_spec = torch.clamp(mel_spec, min=1e-10).log10()
    log_spec = torch.maximum(log_spec, log_spec.max() - 8.0)
    log_spec = (log_spec + 4.0) / 4.0
    return log_spec.numpy()


def audio_to_mel(
    audio: np.ndarray, sample_rate=16000, n_fft=400, hop_length=160, n_mels=80
):
    return log_mel_spectrogram(audio)


# def audio_to_mel(audio: np.ndarray, sample_rate=16000, n_fft=400, hop_length=160, n_mels=80):
#     if audio.ndim > 1:
#         print("Warning: Audio has multiple channels, averaging them.")
#         audio = np.mean(audio, axis=0)
#     if sample_rate != 16000:
#         print(f"Resampling audio from {sample_rate}Hz to 16000Hz")
#         audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=16000)

#     stft = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length, win_length=n_fft, center=False)
#     mel_basis = librosa.filters.mel(sr=16000, n_fft=n_fft, n_mels=n_mels)
#     mel = mel_basis @ np.abs(stft)
#     mel = np.log10(np.maximum(mel, 1e-10))

#     # Normalize to zero mean and unit variance
#     mel = (mel - mel.mean()) / (mel.std() + 1e-5)

#     return mel.astype(np.float32)


def chunk_waveform_with_overlap(
    waveform: np.ndarray, sample_rate=16000, chunk_duration_sec=30, overlap_sec=0
):
    chunk_size = chunk_duration_sec * sample_rate
    overlap_size = overlap_sec * sample_rate
    step = chunk_size - overlap_size

    total_samples = len(waveform)
    chunks = []

    for start in range(0, total_samples, step):
        end = start + chunk_size
        chunk_wave = waveform[start:end]

        if len(chunk_wave) < chunk_size:
            print(
                f"Warning: Chunk from {start} to {end} has only {len(chunk_wave)} samples, padding to {chunk_size} samples."
            )
            pad_width = chunk_size - len(chunk_wave)
            chunk_wave = np.pad(chunk_wave, (0, pad_width), mode="constant")

        chunks.append(chunk_wave)

        if end >= total_samples:
            print(
                f"Reached end of waveform at sample {end}. No more chunks can be created."
            )
            break

    return chunks


def plot_waveform_and_mel_chunks(chunk, mel, sr, hop_length=256):

    # Plot waveform
    plt.figure(figsize=(14, 4))
    plt.title("Chunk waveform")
    time = np.linspace(0, len(chunk) / sr, num=len(chunk))
    plt.plot(time, chunk)
    plt.xlabel("Time (s)")
    plt.ylabel("Amplitude")
    plt.grid(True)
    plt.tight_layout()
    plt.show()

    mel_db = mel

    # Plot mel spectrogram
    plt.figure(figsize=(14, 4))
    librosa.display.specshow(
        mel_db, sr=sr, hop_length=hop_length, x_axis="time", y_axis="mel"
    )
    plt.title(f"Chunk  - Mel Spectrogram")
    plt.colorbar(format="%+2.0f dB")
    plt.tight_layout()
    plt.show()


def preprocess_audio(audio_path: str):
    waveform, sr = librosa.load(audio_path, sr=16000, mono=True)
    max_val = np.max(np.abs(waveform)) + 1e-8  # avoid div by zero
    waveform = waveform / max_val
    waveform = np.clip(waveform, -1.0, 1.0)

    waveform_chunks = chunk_waveform_with_overlap(waveform, sample_rate=sr)
    mel_chunks = []
    for chunk in waveform_chunks:
        mel = audio_to_mel(chunk, sample_rate=sr)
        # plot_waveform_and_mel_chunks(chunk,mel, sr, hop_length=160)
        mel_chunks.append(mel)  # Ensure each mel is 3000 frames
        # mel_chunks.append(pad_or_trim_mel(mel))  # Ensure each mel is 3000 frames
    print(f"Processed {len(mel_chunks)} chunks of mel spectrograms.")
    return mel_chunks
