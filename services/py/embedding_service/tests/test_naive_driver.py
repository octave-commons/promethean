import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve()
sys.path.insert(0, str(BASE_DIR.parents[2]))
sys.path.insert(0, str(BASE_DIR.parents[4]))

from embedding_service.drivers import naive_driver


def test_simple_embedding_uses_vector_size():
    driver = naive_driver.NaiveDriver()
    vec = driver._simple("abc")
    assert len(vec) == naive_driver.VECTOR_SIZE


def test_simple_embedding_respects_vector_size_change(monkeypatch):
    monkeypatch.setattr(naive_driver, "VECTOR_SIZE", 512)
    driver = naive_driver.NaiveDriver()
    vec = driver._simple("a")
    assert len(vec) == 512
    idx = ord("a") % 512
    assert vec[idx] == 1.0
