# SPDX-License-Identifier: GPL-3.0-only
"""Utilities for splitting text into sentence-based chunks."""

import logging
import re

# module level logger
log = logging.getLogger(__name__)

# Precompiled regex for sentence splitting to avoid recompilation overhead
_SENTENCE_RE = re.compile(r"(?<=[.!?]) +")


def _split_long_sentence(sentence: str, max_len: int) -> list[str]:
    """Break a long sentence into sub-chunks no longer than ``max_len``."""
    pieces: list[str] = []
    current = ""
    for word in sentence.split():
        if current and len(current) + len(word) + 1 > max_len:
            pieces.append(current)
            current = word
        else:
            current = f"{current} {word}".strip()
    if current:
        pieces.append(current)
    return pieces


def split_sentences(
    text: str, max_chunk_len: int = 79, min_chunk_len: int = 20
) -> list[str]:
    """Return a list of sentence-like chunks from ``text``.

    Sentences longer than ``max_chunk_len`` are split by words. Short
    chunks are merged with following chunks when possible and the final
    chunk is padded with an ellipsis if it falls below ``min_chunk_len``.
    """

    log.debug(
        "Splitting text into sentence-aware chunks (max %s, min %s).",
        max_chunk_len,
        min_chunk_len,
    )
    log.debug("Input text length: %d characters", len(text))

    sentences = re.split(r"(?<=[.!?]) +", text.strip())
    log.debug("Found %d sentences.", len(sentences))

    expanded: list[str] = []
    for sentence in sentences:
        if len(sentence) > max_chunk_len:
            expanded.extend(_split_long_sentence(sentence, max_chunk_len))
        else:
            expanded.append(sentence)

    chunks: list[str] = []
    current = ""
    for sentence in expanded:
        potential = f"{current} {sentence}".strip() if current else sentence
        if current and len(potential) > max_chunk_len:
            chunks.append(current)
            current = sentence
        else:
            current = potential

    if current:
        chunks.append(current)

    # Merge short chunks with the following chunk when possible
    i = 0
    while i < len(chunks) - 1:
        if len(chunks[i]) < min_chunk_len:
            merged = f"{chunks[i]} {chunks[i + 1]}".strip()
            if len(merged) <= max_chunk_len:
                chunks[i] = merged
                del chunks[i + 1]
                continue
        i += 1

    if chunks and len(chunks[-1]) < min_chunk_len:
        chunks[-1] += " ..."

    for chunk in chunks:
        log.debug("Chunk: '%s' (length: %d)", chunk, len(chunk))

    return chunks
