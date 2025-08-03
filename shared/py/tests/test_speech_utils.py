import importlib
import types
import os
import sys
import pytest
import numpy as np

# from unittest import mock

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

ROOT_DIR = os.path.join(os.path.dirname(__file__), "..")


def load_stt_module():
    """Import speech.stt with heavy deps stubbed."""
    dummy_torch = types.ModuleType("torch")
    dummy_torch.Tensor = np.ndarray
    dummy_torch.stack = lambda seq: np.stack(seq)
    functional = types.ModuleType("torch.nn.functional")
    functional.pad = lambda x, pad, mode="constant", value=0: x
    dummy_torch.nn = types.ModuleType("torch.nn")
    dummy_torch.nn.functional = functional

    dummy_torchaudio = types.ModuleType("torchaudio")
    dummy_torchaudio.load = lambda *a, **k: (np.zeros((1, 16000)), 16000)

    class DummyResample:
        def __init__(self, orig_freq, new_freq):
            pass

        def __call__(self, waveform):
            return waveform

    dummy_torchaudio.transforms = types.SimpleNamespace(Resample=DummyResample)

    dummy_transformers = types.ModuleType("transformers")
    dummy_transformers.Wav2Vec2ForCTC = types.SimpleNamespace(
        from_pretrained=lambda *a, **k: None
    )
    dummy_transformers.Wav2Vec2Processor = types.SimpleNamespace(
        from_pretrained=lambda *a, **k: None
    )
    dummy_transformers.AutoTokenizer = types.SimpleNamespace(
        from_pretrained=lambda *a, **k: types.SimpleNamespace(
            __call__=lambda text, return_tensors=None: types.SimpleNamespace(
                input_ids=None, attention_mask=None
            )
        )
    )
    dummy_transformers.AutoModelForSeq2SeqLM = types.SimpleNamespace(
        from_pretrained=lambda *a, **k: types.SimpleNamespace(
            generate=lambda *a, **k: [0]
        )
    )

    dummy_ov = types.ModuleType("openvino")

    class DummyInput:
        def get_partial_shape(self):
            return None

        def __hash__(self):
            return 1

    class DummyModel:
        def __init__(self):
            self.inputs = [DummyInput()]

        def reshape(self, mapping):
            pass

    dummy_ov.convert_model = lambda *a, **k: DummyModel()
    dummy_ov.compile_model = lambda *a, **k: lambda inputs: {"logits": [0]}
    dummy_ov.PartialShape = lambda x: None

    dummy_symspellpy = types.ModuleType("symspellpy.symspellpy")

    class DummySymSpell:
        def __init__(self, *args, **kwargs):
            pass

        def load_dictionary(self, *a, **k):
            pass

    dummy_symspellpy.SymSpell = DummySymSpell
    dummy_symspellpy.Verbosity = object

    sys.modules.setdefault("torch", dummy_torch)
    sys.modules.setdefault("torch.nn", dummy_torch.nn)
    sys.modules.setdefault("torch.nn.functional", dummy_torch.nn.functional)
    sys.modules.setdefault("torchaudio", dummy_torchaudio)
    sys.modules.setdefault("openvino", dummy_ov)
    sys.modules.setdefault("transformers", dummy_transformers)
    sys.modules.setdefault("symspellpy.symspellpy", dummy_symspellpy)
    return importlib.import_module("shared.py.speech.stt")


stt = load_stt_module()
from shared.py.speech.wav import normalize_audio

clamp_freq = stt.clamp_freq
convert_to_mono_np = stt.convert_to_mono_np
convert_to_mono = stt.convert_to_mono


def test_clamp_freq_bounds():
    assert clamp_freq(-10, 16000) == 1.0
    nyquist = 16000 / 2
    assert clamp_freq(nyquist + 1000, 16000) == nyquist - 1.0
    assert clamp_freq(1000, 16000) == 1000


def test_convert_to_mono_np_channels_samples():
    stereo = np.array([[1.0, -1.0, 0.5], [0.0, 0.5, -0.5]])  # shape [2,3]
    mono = convert_to_mono_np(stereo)
    expected = np.array([0.5, -0.25, 0.0])
    assert np.allclose(mono, expected)


def test_convert_to_mono_np_samples_channels():
    stereo = np.array([[1.0, 0.0], [-1.0, 0.5], [0.5, -0.5]])  # shape [3,2]
    mono = convert_to_mono_np(stereo)
    expected = np.array([0.5, -0.25, 0.0])
    assert np.allclose(mono, expected)


def test_convert_to_mono_dispatch_numpy():
    stereo = np.array([[1.0, -1.0], [0.5, 0.0]])
    mono = convert_to_mono(stereo)
    assert mono.shape == (2,)


def test_convert_to_mono_invalid_type():
    with pytest.raises(TypeError):
        convert_to_mono("invalid")


def test_normalize_audio_no_clip():
    data = np.array([0.0, 0.5, -1.0])
    assert np.allclose(normalize_audio(data), data)
