import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared", "py"))

import numpy as np

from utils.text_preprocessing import (
    expand_abbreviations,
    collapse_whitespace,
    text_to_sequence,
    _symbols_to_sequence,
)
from utils.numbers import normalize_numbers
from utils.embeddings_processing import PCA


def test_expand_abbreviations_and_numbers():
    text = "Dr. Smith bought 2nd house for $1.01."
    expanded = expand_abbreviations(text.lower())
    expanded = normalize_numbers(expanded)
    assert expanded == "doctor smith bought second house for one dollar, one cent."


def test_collapse_whitespace():
    text = "Hello\n   world\t\t!"
    assert collapse_whitespace(text) == "Hello world !"


def test_text_to_sequence_consistency():
    text = "Dr. Strange has 2 apples."
    seq = text_to_sequence(text)
    expected = _symbols_to_sequence("doctor strange has two apples.")
    assert seq == expected


def test_pca_round_trip():
    data = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
    pca = PCA(n_components=1)
    proj = pca.build(data)
    reconstructed = pca.iproject(proj)
    assert np.allclose(reconstructed, data)
