# SPDX-License-Identifier: GPL-3.0-only
import numpy as np
import pytest

from shared.py.utils.wav_processing import (
    pad_tensor,
    fold_with_overlap,
    xfade_and_unfold,
    get_one_hot,
    infer_from_discretized_mix_logistic,
)


def test_pad_tensor_behaviour():
    x = np.arange(1, 6).reshape(1, 5, 1).astype(float)
    both = pad_tensor(x, 2, "both")
    after = pad_tensor(x, 2, "after")
    before = pad_tensor(x, 2, "before")

    assert both.shape == (1, 9, 1)
    assert after.shape == (1, 7, 1)
    assert before.shape == (1, 7, 1)
    np.testing.assert_array_equal(both[:, 2:7, :], x)
    np.testing.assert_array_equal(after[:, :5, :], x)
    np.testing.assert_array_equal(before[:, 2:, :], x)


def test_fold_with_overlap_and_error():
    x = np.arange(1, 11).reshape(1, 10, 1).astype(float)
    folded, (target, overlap) = fold_with_overlap(x, target=2, overlap=1)
    assert folded.shape == (3, 4, 1)
    np.testing.assert_array_equal(folded[0, :, 0], [1, 2, 3, 4])
    np.testing.assert_array_equal(folded[1, :, 0], [4, 5, 6, 7])
    np.testing.assert_array_equal(folded[2, :, 0], [7, 8, 9, 10])

    short = np.arange(1, 4).reshape(1, 3, 1).astype(float)
    with pytest.raises(ValueError):
        fold_with_overlap(short, target=2, overlap=1)


def test_xfade_and_unfold():
    folded = np.array(
        [
            [1, 2, 3, 4],
            [4, 5, 6, 7],
            [7, 8, 9, 10],
        ],
        dtype=float,
    )
    result = xfade_and_unfold(folded, overlap=1)
    assert result.shape == (10,)
    assert not np.isnan(result).any()


def test_get_one_hot_and_infer_from_dml():
    arr = np.array([0, 2])
    one_hot = get_one_hot(arr, 4)
    expected = np.array([[1, 0, 0, 0], [0, 0, 1, 0]], dtype=float)
    np.testing.assert_array_equal(one_hot, expected)

    params = np.random.rand(1, 6, 2)
    output = infer_from_discretized_mix_logistic(params)
    assert output.shape == (1, 2)
    assert np.all(output >= -1.0) and np.all(output <= 1.0)
