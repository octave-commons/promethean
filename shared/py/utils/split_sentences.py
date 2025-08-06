"""Utilities for splitting text into sentence-based chunks."""

import logging
import re

# module level logger
log = logging.getLogger(__name__)

# Precompiled regex for sentence splitting to avoid recompilation overhead
_SENTENCE_RE = re.compile(r"(?<=[.!?]) +")


def split_sentences(text, max_chunk_len=79, min_chunk_len=20):
    """Return a list of sentence-like chunks from ``text``.

    Parameters
    ----------
    text : str
        Input paragraph to be chunked.
    max_chunk_len : int, optional
        Hard limit for chunk size; longer sentences are split by words.
        Defaults to ``79``.
    min_chunk_len : int, optional
        Minimum chunk length. Short chunks will try to absorb following
        sentences to reach this length. Defaults to ``20``.

    Returns
    -------
    list[str]
        Sequence of chunks derived from the input.
    """

    log.debug(
        "Splitting text into sentence-aware chunks (max %s, min %s).",
        max_chunk_len,
        min_chunk_len,
    )
    log.debug("Input text length: %d characters", len(text))

    # First pass: basic sentence splitting
    sentences = _SENTENCE_RE.split(text.strip())
    log.debug("Found %d sentences.", len(sentences))

    all_chunks = []
    current_words: list[str] = []
    current_len = 0

    i = 0
    while i < len(sentences):
        sentence = sentences[i]

        # If sentence is too long, split by words
        if len(sentence) > max_chunk_len:
            for word in sentence.split():
                added = len(word) + (1 if current_words else 0)
                if current_len + added > max_chunk_len and current_len >= min_chunk_len:
                    all_chunks.append(" ".join(current_words))
                    current_words = []
                    current_len = 0
                    added = len(word)
                if current_words:
                    current_len += 1
                current_words.append(word)
                current_len += len(word)
        else:
            # Would adding this sentence bust the limit?
            added = len(sentence) + (1 if current_words else 0)
            if current_len + added > max_chunk_len:
                if current_len >= min_chunk_len:
                    all_chunks.append(" ".join(current_words))
                    current_words = []
                    current_len = 0
                    added = len(sentence)
                else:
                    # Try to append next sentence to reach min length
                    while current_len + added < min_chunk_len and i + 1 < len(
                        sentences
                    ):
                        sentence += " " + sentences[i + 1]
                        i += 1
                        added = len(sentence) + (1 if current_words else 0)
                        if len(sentence) > max_chunk_len:
                            break
                    # At this point, try again to add
                    if (
                        current_len + added > max_chunk_len
                        and current_len >= min_chunk_len
                    ):
                        all_chunks.append(" ".join(current_words))
                        current_words = []
                        current_len = 0
                        added = len(sentence)

            if current_words:
                current_len += 1
            current_words.append(sentence)
            current_len += len(sentence)

        i += 1

    if current_words:
        if current_len < min_chunk_len:
            current_words.append("...")
        all_chunks.append(" ".join(current_words).strip())

    for chunk in all_chunks:
        log.debug("Chunk: '%s' (length: %d)", chunk, len(chunk))

    return all_chunks
