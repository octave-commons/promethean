"""
Audio preprocessing utilities for Whisper on NPU.

This module provides an :class:`AudioProcessor` class which handles
loading audio files, normalising waveforms and converting them into
mel‑spectrogram chunks.  All parameters are taken from a
:class:`whisper_npu.config.Config` instance.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator, List, Optional

import numpy as np
import torch
import librosa
import torch.nn.functional as F

from .config import Config

LOGGER = logging.getLogger(__name__)


@dataclass
class AudioProcessor:
    """Convert raw audio into Whisper mel‑spectrogram chunks.

    Parameters
    ----------
    config: Config
        Configuration controlling sample rate, FFT size, hop length and chunk
        duration.
    filter_bank_path: Path, optional
        Optional path to a ``mel_filters.npz`` file containing pre‑computed
        mel filter banks.  If omitted, the filter bank will be computed
        using ``librosa.filters.mel`` each time.  To avoid the heavy
        dependency on librosa's mel filter creation, you can pre‑compute
        the filter bank and save it to disk.
    """

    config: Config
    filter_bank_path: Optional[Path] = None

    def _load_waveform(self, audio: np.ndarray | str) -> np.ndarray:
        """Load an audio file or normalise an array.

        Whisper expects mono audio at the configured sample rate with values
        normalised between ‑1 and 1.

        Parameters
        ----------
        audio: numpy.ndarray or str
            If a path is given, the file will be loaded using
            ``librosa.load``.  If an array is given, it will be
            resampled if necessary and converted to float32.

        Returns
        -------
        numpy.ndarray
            A 1‑D array of audio samples.
        """
        sr = self.config.sample_rate
        if isinstance(audio, str):
            waveform, file_sr = librosa.load(audio, sr=sr, mono=True)
        else:
            waveform = np.asarray(audio, dtype=np.float32).squeeze()
            file_sr = sr  # assume already correct sample rate
            if audio.ndim > 1:
                waveform = np.mean(waveform, axis=0)
        # resample if necessary
        if file_sr != sr:
            waveform = librosa.resample(waveform, orig_sr=file_sr, target_sr=sr)
        # normalise
        max_val = np.max(np.abs(waveform)) + 1e-8
        waveform = np.clip(waveform / max_val, -1.0, 1.0)
        return waveform.astype(np.float32)

    def _mel_filters(self, device: torch.device, n_mels: int) -> torch.Tensor:
        """Return the mel filter bank tensor on the given device."""
        assert n_mels in {80, 128}, f"Unsupported n_mels: {n_mels}"
        if self.filter_bank_path:
            with np.load(self.filter_bank_path, allow_pickle=False) as f:
                filter_name = f"mel_{n_mels}"
                return torch.from_numpy(f[filter_name]).to(device)
        # compute on the fly via librosa
        mel = librosa.filters.mel(
            sr=self.config.sample_rate,
            n_fft=self.config.n_fft,
            n_mels=n_mels,
        )
        return torch.from_numpy(mel).to(device)

    def _log_mel_spectrogram(self, audio: np.ndarray) -> np.ndarray:
        """Compute the log‑Mel spectrogram for a single audio chunk."""
        device = torch.device("cpu")
        x = torch.from_numpy(audio).to(device)
        # no additional padding here; chunking handles that
        window = torch.hann_window(self.config.n_fft).to(device)
        stft = torch.stft(
            x,
            self.config.n_fft,
            self.config.hop_length,
            window=window,
            return_complex=True,
        )
        magnitudes = stft[..., :-1].abs() ** 2
        filters = self._mel_filters(device, self.config.n_mels)
        mel_spec = filters @ magnitudes
        log_spec = torch.clamp(mel_spec, min=1e-10).log10()
        log_spec = torch.maximum(log_spec, log_spec.max() - 8.0)
        log_spec = (log_spec + 4.0) / 4.0
        return log_spec.numpy()

    def _chunk_waveform(self, waveform: np.ndarray) -> List[np.ndarray]:
        """Split a waveform into fixed‑length overlapping chunks."""
        chunk_size = self.config.sample_rate * self.config.chunk_length
        step = chunk_size  # no overlap by default; can be extended
        total = len(waveform)
        chunks: List[np.ndarray] = []
        for start in range(0, total, step):
            end = start + chunk_size
            chunk = waveform[start:end]
            if len(chunk) < chunk_size:
                # pad with zeros
                pad_width = chunk_size - len(chunk)
                chunk = np.pad(chunk, (0, pad_width), mode="constant")
            chunks.append(chunk)
            if end >= total:
                break
        return chunks

    def to_mel_chunks(self, audio: np.ndarray | str) -> List[np.ndarray]:
        """Convert raw audio (array or path) into a list of mel spectrograms.

        Each mel spectrogram has shape ``(n_mels, n_frames)`` where
        ``n_frames == config.n_frames()``.  The number of chunks depends on
        the length of the input.
        """
        waveform = self._load_waveform(audio)
        chunks = self._chunk_waveform(waveform)
        mel_chunks: List[np.ndarray] = []
        for idx, chunk in enumerate(chunks):
            mel = self._log_mel_spectrogram(chunk)
            mel = mel[:, : self.config.n_frames()]  # ensure correct length
            mel_chunks.append(mel)
            LOGGER.debug("Processed chunk %d → mel shape %s", idx, mel.shape)
        return mel_chunks
