"""
Token and text post‑processing for Whisper models.

The :class:`PostProcessor` encapsulates the logic used to remove special
tokens, trim overlapping text between chunks and deduplicate repeated
n‑grams.  It can be used independently of the decoding logic to
clean up token sequences before converting them back to text.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Dict, List, Optional

from transformers import PreTrainedTokenizerBase  # type: ignore
from difflib import SequenceMatcher

LOGGER = logging.getLogger(__name__)


@dataclass
class PostProcessor:
    """Perform cleanup on token sequences.

    Parameters
    ----------
    tokenizer: PreTrainedTokenizerBase
        Tokeniser used to decode and re‑encode tokens.  Should be the same
        instance used during decoding.
    overlap_window: int
        Number of tokens from the previous chunk to consider when trimming
        overlapping text.
    max_ngram: int
        Maximum n‑gram length for deduplication.  Longer n‑grams will not be
        considered when removing repeats.
    """

    tokenizer: PreTrainedTokenizerBase
    overlap_window: int = 64
    max_ngram: int = 6

    def _remove_special_tokens(self, tokens: List[int]) -> List[int]:
        """Strip special tokens such as BOS/EOS."""
        return [t for t in tokens if t not in self.tokenizer.all_special_ids]

    def _trim_overlap(self, prior_tokens: List[int], current_tokens: List[int]) -> List[int]:
        """Trim redundant text at the start of the current chunk.

        Compares the end of ``prior_tokens`` with the start of
        ``current_tokens`` on the string level and removes the overlap.
        """
        prior_text = self.tokenizer.decode(prior_tokens[-self.overlap_window :]) if prior_tokens else ""
        current_text = self.tokenizer.decode(current_tokens)
        prev_words = prior_text.strip().split()
        curr_words = current_text.strip().split()
        max_prev = 40
        prev_words = prev_words[-max_prev:]
        sm = SequenceMatcher(None, prev_words, curr_words)
        match = sm.find_longest_match(0, len(prev_words), 0, len(curr_words))
        if match.size > 3 and match.b == 0:
            trimmed = curr_words[match.size :]
        else:
            trimmed = curr_words
        return self.tokenizer(" ".join(trimmed), add_special_tokens=False).input_ids

    def _dedupe_ngrams(self, tokens: List[int]) -> List[int]:
        """Remove repeated n‑grams from the token sequence."""
        from collections import defaultdict
        seen: Dict[int, set] = defaultdict(set)
        output: List[int] = []
        i = 0
        while i < len(tokens):
            found_repeat = False
            for n in range(self.max_ngram, 1, ‑1):
                if i + n > len(tokens):
                    continue
                ngram = tuple(tokens[i : i + n])
                if ngram in seen[n]:
                    i += n
                    found_repeat = True
                    break
                else:
                    seen[n].add(ngram)
            if not found_repeat:
                output.append(tokens[i])
                i += 1
        return output

    def clean_tokens(self, tokens: List[int], prior_tokens: Optional[List[int]] = None) -> List[int]:
        """Clean up a list of token IDs.

        This method removes special tokens, trims overlapping text with
        ``prior_tokens`` and deduplicates n‑grams.  If ``prior_tokens`` is
        omitted, only special tokens and n‑gram deduplication are applied.
        """
        # strip special tokens
        tokens = self._remove_special_tokens(tokens)
        if prior_tokens:
            tokens = self._trim_overlap(prior_tokens, tokens)
        tokens = self._dedupe_ngrams(tokens)
        LOGGER.debug("Cleaned token sequence length %d", len(tokens))
        return tokens