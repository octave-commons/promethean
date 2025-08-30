"""
 Copyright (c) 2020-2024 Intel Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

This file is based in cleaners.py from https://github.com/keithito/tacotron,
commit d26c763342518d4e432e9c4036a1aff3b4fdaa1e on Feb 3, 2020
"""

import logging
import re
import re
from .numbers import normalize_numbers


_pad = "_"
_punctuation = "!'(),.:;? "
_special = "-"
_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"


# Export all symbols:
symbols = [_pad] + list(_special) + list(_punctuation) + list(_letters)


_symbol_to_id = {s: i for i, s in enumerate(symbols)}


_abbreviations = [
    (re.compile("\\b%s\\." % x[0], re.IGNORECASE), x[1])
    for x in [
        ("mrs", "misess"),
        ("mr", "mister"),
        ("dr", "doctor"),
        ("st", "saint"),
        ("co", "company"),
        ("jr", "junior"),
        ("maj", "major"),
        ("gen", "general"),
        ("drs", "doctors"),
        ("rev", "reverend"),
        ("lt", "lieutenant"),
        ("hon", "honorable"),
        ("sgt", "sergeant"),
        ("capt", "captain"),
        ("esq", "esquire"),
        ("ltd", "limited"),
        ("col", "colonel"),
        ("ft", "fort"),
    ]
]


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


def expand_abbreviations(text):
    for regex, replacement in _abbreviations:
        text = re.sub(regex, replacement, text)
    return text


def collapse_whitespace(text):
    _whitespace_re = re.compile(r"\s+")
    return re.sub(_whitespace_re, " ", text)


def text_to_sequence(text):
    """Converts a string of text to a sequence of IDs corresponding to the symbols in the text.
    The text can optionally have ARPAbet sequences enclosed in curly braces embedded
    in it. For example, "Turn left on {HH AW1 S S T AH0 N} Street."
    Args:
      text: string to convert to a sequence
      cleaner_names: names of the cleaner functions to run the text through
    Returns:
      List of integers corresponding to the symbols in the text
    """
    text = text.lower()
    text = normalize_numbers(text)
    text = expand_abbreviations(text)
    text = collapse_whitespace(text)

    sequence = _symbols_to_sequence(text)
    return sequence


def _symbols_to_sequence(symbols):
    return [_symbol_to_id[s] for s in symbols if _should_keep_symbol(s)]


def _should_keep_symbol(s):
    return s in _symbol_to_id and s != _pad
