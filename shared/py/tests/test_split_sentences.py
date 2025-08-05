import os
import sys
from shared.py.utils.split_sentences import split_sentences

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared", "py"))

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)


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


def test_appends_filler_for_short_text():
    chunks = split_sentences("Hi.", max_chunk_len=10, min_chunk_len=5)
    assert chunks == ["Hi. ..."]


def test_long_sentence_breaks_into_multiple_chunks():
    text = "This is a very long sentence that is definitely going to exceed the max limit by a considerable margin."
    chunks = split_sentences(text, max_chunk_len=40, min_chunk_len=5)
    assert len(chunks) > 1
