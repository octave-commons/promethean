"""Utilities for splitting text into sentence-based chunks."""

import re


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

    print(
        f"Splitting text into sentence-aware chunks (max {max_chunk_len}, min {min_chunk_len})."
    )
    print(f"Input text length: {len(text)} characters")

    # First pass: basic sentence splitting
    sentences = re.split(r'(?<=[.!?]) +', text.strip())
    print(f"Found {len(sentences)} sentences.")

    all_chunks = []
    current_chunk = ""

    i = 0
    while i < len(sentences):
        sentence = sentences[i]

        # If sentence is too long, split by words
        if len(sentence) > max_chunk_len:
            words = sentence.split()
            for word in words:
                if len(current_chunk) + len(word) + 1 > max_chunk_len:
                    if len(current_chunk) >= min_chunk_len:
                        all_chunks.append(current_chunk.strip())
                        current_chunk = ""
                if current_chunk:
                    current_chunk += " "
                current_chunk += word
        else:
            # Would adding this sentence bust the limit?
            if len(current_chunk) + len(sentence) + 1 > max_chunk_len:
                if len(current_chunk) >= min_chunk_len:
                    all_chunks.append(current_chunk.strip())
                    current_chunk = ""
                else:
                    # Try to append next sentence to reach min length
                    while len(current_chunk) < min_chunk_len and i + 1 < len(sentences):
                        sentence += " " + sentences[i + 1]
                        i += 1
                        if len(sentence) > max_chunk_len:
                            break
                    # At this point, try again to add
                    if len(current_chunk) + len(sentence) + 1 > max_chunk_len:
                        all_chunks.append(current_chunk.strip())
                        current_chunk = ""

            if current_chunk:
                current_chunk += " "
            current_chunk += sentence

        i += 1

    if current_chunk:
        if len(current_chunk) < min_chunk_len:
            current_chunk += " ..."  # Or your filler of choice
        all_chunks.append(current_chunk.strip())

    for chunk in all_chunks:
        print(f"Chunk: '{chunk}' (length: {len(chunk)})")

    return all_chunks
