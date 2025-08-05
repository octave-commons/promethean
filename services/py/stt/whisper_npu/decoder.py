"""
Token decoding logic for Whisper models.

This module defines abstract and concrete decoders.  ``DecoderBase`` handles
shared logic, such as maintaining the past key/value cache and converting
starting tokens.  ``GreedyDecoder`` produces one token at a time until the
end‑of‑sentence token is encountered or a maximum length is reached.
``BeamDecoder`` implements beam search, exploring multiple candidate
sequences at each step.  Both decoders rely on a :class:`ModelManager` to
run the underlying encoder and decoder models.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np

from .config import Config
from .models import ModelManager
from .post_processing import PostProcessor

LOGGER = logging.getLogger(__name__)


@dataclass
class DecoderBase:
    """Base class for token decoders.

    Parameters
    ----------
    model_manager: ModelManager
        Provides access to the encoder, cross‑kv and decoder models.
    config: Config
        Configuration controlling maximum token length and beam size.
    post_processor: Optional[PostProcessor]
        Optional post‑processing helper used to clean up token sequences.
    """

    model_manager: ModelManager
    config: Config
    post_processor: Optional[PostProcessor] = None
    start_tokens: List[str] = field(
        default_factory=lambda: ["<|startoftranscript|>", "<|en|>", "<|notimestamps|>"]
    )

    def encode(self, mel: np.ndarray) -> Dict[str, np.ndarray]:
        """Encode a mel spectrogram and compute cross‑kv outputs."""
        encoded = self.model_manager.run_encoder(mel)
        return self.model_manager.run_cross_kv(encoded)

    def _init_cache(self) -> Dict[str, np.ndarray]:
        """Initialise an empty past key/value cache.

        Concrete implementations may override this to allocate the correct
        shapes.  For testing, an empty dict suffices.
        """
        return {}

    def _next_token(
        self,
        tokens: List[int],
        position_ids: np.ndarray,
        attention_mask: np.ndarray,
        encoder_kv: Dict[str, np.ndarray],
        past_kv: Dict[str, np.ndarray],
    ) -> Tuple[int, Dict[str, np.ndarray]]:
        """Generate the next token and update the cache.

        Concrete implementations should call ``model_manager.run_decoder_step``
        and apply a decoding strategy (e.g. argmax or sampling).
        Returns the selected token ID and the updated past_kv.
        """
        raise NotImplementedError

    def decode_chunk(
        self,
        mel: np.ndarray,
        prior_tokens: Optional[List[int]] = None,
    ) -> List[int]:
        """Decode a single mel chunk into a sequence of token IDs.

        Parameters
        ----------
        mel: np.ndarray
            Mel spectrogram of shape ``(n_mels, n_frames)``.
        prior_tokens: list[int], optional
            Tokens from previous chunks that should be considered for
            continuity.  Only the last ``prior_tokens_limit`` tokens are used.

        Returns
        -------
        list[int]
            Decoded tokens for this chunk, excluding the initial BOS/EN
            special tokens.
        """
        # encode mel and get cross‑kv outputs
        cross_kv = self.encode(mel)
        # initialise cache and starting token list
        prior_tokens = prior_tokens or []
        tokens = (
            self.model_manager.tokenizer.convert_tokens_to_ids(self.start_tokens)
            + prior_tokens.copy()
        )
        past_kv: Dict[str, np.ndarray] = self._init_cache()
        eos_id = self.model_manager.tokenizer.eos_token_id
        # loop until max length
        while len(tokens) < self.config.max_tokens:
            input_ids = np.array([[tokens[-1]]], dtype=np.int64)
            position_ids = np.array([len(tokens) - 1], dtype=np.int64)
            attention_mask = np.ones((1, len(tokens)), dtype=np.int64)
            attn_pad = self.config.max_tokens - len(tokens)
            if attn_pad > 0:
                attention_mask = np.pad(
                    attention_mask, ((0, 0), (0, attn_pad)), constant_values=0
                )
            next_token, past_kv = self._next_token(
                tokens=tokens,
                position_ids=position_ids,
                attention_mask=attention_mask,
                encoder_kv=cross_kv,
                past_kv=past_kv,
            )
            if next_token == eos_id:
                break
            tokens.append(next_token)
        # remove the start special tokens
        cleaned = tokens[len(self.start_tokens) :]
        if self.post_processor:
            cleaned = self.post_processor.clean_tokens(
                cleaned, prior_tokens=prior_tokens
            )
        return cleaned


@dataclass
class GreedyDecoder(DecoderBase):
    """Greedy decoder for Whisper.

    Selects the most probable next token at each step using argmax over the
    logits.  This class requires a functioning :class:`ModelManager`.  In
    tests, it can be used with a stubbed manager that returns deterministic
    logits.
    """

    def _next_token(
        self,
        tokens: List[int],
        position_ids: np.ndarray,
        attention_mask: np.ndarray,
        encoder_kv: Dict[str, np.ndarray],
        past_kv: Dict[str, np.ndarray],
    ) -> Tuple[int, Dict[str, np.ndarray]]:
        logits = self.model_manager.run_decoder_step(
            input_ids=np.array([[tokens[-1]]], dtype=np.int64),
            attention_mask=attention_mask,
            position_ids=position_ids,
            encoder_kv=encoder_kv,
            past_kv=past_kv,
        )
        # greedy selection
        next_token = int(np.argmax(logits[0, -1]))
        return next_token, past_kv


@dataclass
class BeamDecoder(DecoderBase):
    """Beam search decoder for Whisper.

    Maintains multiple candidate beams and selects the best sequences based on
    a length‑penalised score.  The beam width is controlled by
    ``config.beam_size``.
    """

    def _next_token(self, *args, **kwargs):  # pragma: no cover
        # Beam decoding uses a completely different loop; we do not use this.
        raise RuntimeError("BeamDecoder._next_token should not be called")

    @dataclass
    class Beam:
        tokens: List[int]
        score: float
        kv_cache: Dict[str, np.ndarray]
        finished: bool = False

    def decode_chunk(
        self,
        mel: np.ndarray,
        prior_tokens: Optional[List[int]] = None,
    ) -> List[int]:
        cross_kv = self.encode(mel)
        prior_tokens = prior_tokens or []
        start_ids = self.model_manager.tokenizer.convert_tokens_to_ids(
            self.start_tokens
        )
        eos_id = self.model_manager.tokenizer.eos_token_id
        # initialise beams
        initial_tokens = start_ids + prior_tokens.copy()
        beams: List[BeamDecoder.Beam] = [
            BeamDecoder.Beam(
                tokens=initial_tokens,
                score=0.0,
                kv_cache=self._init_cache(),
                finished=False,
            )
        ]
        for _ in range(self.config.max_tokens):
            all_candidates: List[BeamDecoder.Beam] = []
            for beam in beams:
                if beam.finished:
                    all_candidates.append(beam)
                    continue
                # prepare decoder inputs
                input_ids = np.array([[beam.tokens[-1]]], dtype=np.int64)
                position_ids = np.array([len(beam.tokens) - 1], dtype=np.int64)
                attn_mask = np.ones((1, len(beam.tokens)), dtype=np.int64)
                pad = self.config.max_tokens - len(beam.tokens)
                if pad > 0:
                    attn_mask = np.pad(attn_mask, ((0, 0), (0, pad)), constant_values=0)
                logits = self.model_manager.run_decoder_step(
                    input_ids=input_ids,
                    attention_mask=attn_mask,
                    position_ids=position_ids,
                    encoder_kv=cross_kv,
                    past_kv=beam.kv_cache,
                )
                # compute log probabilities
                log_probs = logits[0, -1] - np.log(np.sum(np.exp(logits[0, -1])))
                # select top k
                top_indices = np.argsort(log_probs)[::-1][: self.config.beam_size]
                for token_id in top_indices:
                    gen_len = len(beam.tokens) - len(start_ids) + 1
                    new_score = beam.score + log_probs[token_id]
                    length_penalty = ((5 + gen_len) / 6) ** 0.6
                    adjusted_score = new_score / length_penalty
                    new_tokens = beam.tokens + [int(token_id)]
                    finished = int(token_id) == eos_id
                    # copy kv cache (shallow copy is fine for numpy arrays if updated in place)
                    new_cache = {k: np.copy(v) for k, v in beam.kv_cache.items()}
                    all_candidates.append(
                        BeamDecoder.Beam(
                            tokens=new_tokens,
                            score=adjusted_score,
                            kv_cache=new_cache,
                            finished=finished,
                        )
                    )
            # prune
            beams = sorted(all_candidates, key=lambda b: b.score, reverse=True)[
                : self.config.beam_size
            ]
            # early stopping if all beams finished
            if all(b.finished for b in beams):
                break
        best_beam = beams[0]
        cleaned = best_beam.tokens[len(self.start_tokens) :]
        if self.post_processor:
            cleaned = self.post_processor.clean_tokens(
                cleaned, prior_tokens=prior_tokens
            )
        return cleaned
