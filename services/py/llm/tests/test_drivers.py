import os
import sys
from pathlib import Path
import pytest

BASE_DIR = Path(__file__).resolve()
sys.path.insert(0, str(BASE_DIR.parents[2]))
sys.path.insert(0, str(BASE_DIR.parents[4]))

from llm.main import load_model
from llm.drivers.ollama_driver import OllamaDriver
from llm.drivers.huggingface_driver import HuggingFaceDriver


def test_load_ollama_driver():
    os.environ["LLM_DRIVER"] = "ollama"
    os.environ["LLM_MODEL"] = "test-model"
    driver, model = load_model()
    assert isinstance(driver, OllamaDriver)
    assert model == "test-model"


def test_load_huggingface_driver():
    if os.environ.get("SKIP_NETWORK_TESTS") == "1":
        pytest.skip("network tests skipped in sandbox/CI")
    pytest.importorskip("torch")
    os.environ["LLM_DRIVER"] = "huggingface"
    os.environ["LLM_MODEL"] = "sshleifer/tiny-gpt2"
    driver, model = load_model()
    assert isinstance(driver, HuggingFaceDriver)
    tokenizer, model_obj = model
    tokens = tokenizer("hello")["input_ids"]
    assert len(tokens) > 0
