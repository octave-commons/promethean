import importlib
import sys
import types


def test_generation_config(monkeypatch):
    class DummyModel:
        def __init__(self):
            self.generation_config = types.SimpleNamespace()

        def to(self, device):
            return self

        def generate(self, *args, **kwargs):
            return [[0]]

    class DummyProcessor:
        @classmethod
        def from_pretrained(cls, *args, **kwargs):
            processor = types.SimpleNamespace()
            processor.__call__ = lambda *a, **k: {"input_features": None}
            processor.batch_decode = lambda *a, **k: [""]
            return processor

    class DummyModelCls:
        @classmethod
        def from_pretrained(cls, *args, **kwargs):
            return DummyModel()

    dummy_transformers = types.SimpleNamespace(
        WhisperProcessor=DummyProcessor,
        WhisperForConditionalGeneration=DummyModelCls,
    )
    monkeypatch.setitem(sys.modules, "transformers", dummy_transformers)

    class DummyResample:
        def __init__(self, *args, **kwargs):
            pass

        def __call__(self, waveform):
            return waveform

    dummy_torchaudio = types.SimpleNamespace(
        transforms=types.SimpleNamespace(Resample=DummyResample)
    )
    monkeypatch.setitem(sys.modules, "torchaudio", dummy_torchaudio)

    dummy_torch = types.SimpleNamespace(
        cuda=types.SimpleNamespace(is_available=lambda: False),
        device=lambda *a, **k: "cpu",
        Tensor=types.SimpleNamespace,
    )
    monkeypatch.setitem(sys.modules, "torch", dummy_torch)

    dummy_numpy = types.SimpleNamespace()
    dummy_numpy.ndarray = object
    dummy_numpy.frombuffer = lambda *a, **k: []
    dummy_numpy.int16 = "int16"
    dummy_numpy.float32 = "float32"
    dummy_numpy.clip = lambda arr, a, b: arr
    monkeypatch.setitem(sys.modules, "numpy", dummy_numpy)

    module = importlib.import_module("shared.py.speech.wisper_stt")
    assert module.model.generation_config.task == "transcribe"
    assert module.model.generation_config.language == "en"
