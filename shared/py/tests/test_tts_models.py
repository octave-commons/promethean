"""Tests for lightweight initialization of TTS models.

The real OpenVINO and NumPy dependencies are heavy and not required for these
unit tests.  We therefore stub just the minimal pieces needed to import the
modules and instantiate the classes.
"""

import importlib
import os
import sys
import types

import pytest


# Ensure repository root on path
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)


def load_tts_modules():
    """Import TTS modules with OpenVINO and NumPy stubbed."""

    # Preserve references to the actual modules so we can restore them after
    # importing the code under test.
    real_np = importlib.import_module("numpy")
    try:  # pragma: no cover - openvino might not be installed
        real_ov = importlib.import_module("openvino")
    except Exception:  # pragma: no cover
        real_ov = None

    # --- NumPy stub -----------------------------------------------------
    dummy_np = types.ModuleType("numpy")
    for attr in [
        "array",
        "zeros",
        "pad",
        "concatenate",
        "expand_dims",
        "arange",
        "max",
        "where",
        "cumsum",
        "copy",
        "float32",
        "ones",
        "ndarray",
    ]:
        setattr(dummy_np, attr, getattr(real_np, attr))
    sys.modules["numpy"] = dummy_np

    # --- OpenVINO stub --------------------------------------------------
    dummy_ov = types.ModuleType("openvino")
    dummy_ov.PartialShape = lambda shape: shape
    dummy_ov.set_batch = lambda model, _b: None

    class DummyLayout:
        def __init__(self, _):
            pass

    dummy_ov.Layout = DummyLayout
    sys.modules["openvino"] = dummy_ov

    # Import modules under test while stubs are in place
    forward = importlib.import_module("shared.py.models.forward_tacotron_ie")
    wave = importlib.import_module("shared.py.models.mel2wave_ie")

    # Restore real modules for the rest of the test suite
    sys.modules["numpy"] = real_np
    if real_ov is not None:
        sys.modules["openvino"] = real_ov
    else:
        sys.modules.pop("openvino", None)

    # Reload utilities that may have imported the stubbed numpy
    import shared.py.utils.wav_processing as wav_processing

    importlib.reload(wav_processing)

    return forward, wave, real_np


forward_mod, wave_mod, np = load_tts_modules()

check_input_name = forward_mod.check_input_name
ForwardTacotronIE = forward_mod.ForwardTacotronIE
pad_to_max_width = wave_mod.pad_to_max_width
WaveRNNIE = wave_mod.WaveRNNIE


class DummyParameter:
    def set_layout(self, layout):
        pass


class DummyModel:
    def __init__(self, inputs):
        self._inputs = {
            name: types.SimpleNamespace(shape=shape) for name, shape in inputs.items()
        }
        self._params = [DummyParameter()]

    def input(self, name):
        if name not in self._inputs:
            raise RuntimeError("missing input")
        return self._inputs[name]

    def get_parameters(self):
        return self._params

    def reshape(self, mapping):
        for name, shape in mapping.items():
            if name in self._inputs:
                self._inputs[name].shape = shape


class DummyCompiledModel:
    def create_infer_request(self):
        return object()


class DummyCore:
    def __init__(self, models):
        self.models = models

    def read_model(self, path):
        return self.models[path]

    def compile_model(self, model, device_name="CPU"):
        return DummyCompiledModel()


# Helper function tests


def test_check_input_name():
    model = DummyModel({"data": (1, 2)})
    assert check_input_name(model, "data")
    assert not check_input_name(model, "missing")


def test_pad_to_max_width():
    arr1 = np.ones((1, 1, 2))
    arr2 = np.ones((1, 1, 4))
    padded = pad_to_max_width([arr1, arr2])
    assert padded.shape == (2, 1, 4)
    assert np.all(padded[0, :, 2:] == 0)


# Class initialization tests


def test_forward_tacotron_init():
    duration_model = DummyModel({"input_seq": (1, 5)})
    forward_model = DummyModel({"data": (1, 8, 2)})
    core = DummyCore({"dur.xml": duration_model, "fwd.xml": forward_model})

    ft = ForwardTacotronIE("dur.xml", "fwd.xml", core)
    assert ft.duration_len == 5
    assert ft.forward_len == 8
    assert ft.is_attention is False
    assert ft.is_multi_speaker is False


def test_wavernn_init():
    up_model = DummyModel({"mels": (1, 6, 2)})
    rnn_model = DummyModel({"h1.1": (1, 4)})
    core = DummyCore({"up.xml": up_model, "rnn.xml": rnn_model})

    wavernn = WaveRNNIE("up.xml", "rnn.xml", core)
    assert wavernn.mel_len == 6 - 2 * wavernn.pad
    assert wavernn.rnn_width == 4
    assert len(wavernn.rnn_requests) == len(wavernn.batch_sizes)
