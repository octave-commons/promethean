import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../utils")))

import numpy as np
import wav_processing as wp


pad_tensor = wp.pad_tensor
fold_with_overlap = wp.fold_with_overlap
get_one_hot = wp.get_one_hot


def test_pad_tensor_both():
    x = np.array([[[1], [2], [3]]], dtype=float)
    padded = pad_tensor(x, 2, side="both")
    assert padded.shape == (1, 7, 1)
    np.testing.assert_array_equal(padded[0, 2:5, 0], np.array([1, 2, 3]))
    assert np.count_nonzero(padded) == 3


def test_fold_with_overlap_basic():
    x = np.arange(1, 11, dtype=float).reshape(1, 10, 1)
    folded, (target, overlap) = fold_with_overlap(x, target=2, overlap=1)
    assert folded.shape == (3, 4, 1)
    np.testing.assert_array_equal(folded[0, :, 0], np.array([1, 2, 3, 4]))
    np.testing.assert_array_equal(folded[1, :, 0], np.array([4, 5, 6, 7]))
    np.testing.assert_array_equal(folded[2, :, 0], np.array([7, 8, 9, 10]))
    assert target == 2 and overlap == 1


def test_get_one_hot():
    argmaxes = np.array([0, 2])
    one_hot = get_one_hot(argmaxes, 3)
    expected = np.array([[1, 0, 0], [0, 0, 1]])
    np.testing.assert_array_equal(one_hot, expected)
