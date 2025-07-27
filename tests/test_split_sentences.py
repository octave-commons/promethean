import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared", "py"))
import pytest
from utils.split_sentances import split_sentences


def test_split_basic():
    text = "Hello world. This is a test."
    assert split_sentences(text) == ["Hello world. This is a test."]


def test_respects_max_length():
    text = (
        "Sentence one is short. "
        "Sentence two is going to be somewhat longer than the limit we choose. "
        "Short again."
    )
    chunks = split_sentences(text, max_chunk_len=20, min_chunk_len=5)
    assert all(len(chunk) <= 20 for chunk in chunks)
