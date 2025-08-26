"""Tests for :mod:`scripts.index_project_files`."""

from pathlib import Path
import sys
import types

# Provide a lightweight stub for chromadb if it's not installed. This allows
# the tests to run without pulling in heavy optional dependencies.
try:  # pragma: no cover - exercised when chromadb is available
    import chromadb  # type: ignore
    from chromadb.config import Settings  # noqa: F401  - imported for side effect
except ModuleNotFoundError:  # pragma: no cover - stub path
    chromadb = types.ModuleType("chromadb")

    class _DummyCollection:
        def upsert(self, **kwargs):
            pass

    class _DummyClient:
        def get_or_create_collection(self, name):
            return _DummyCollection()

    chromadb.Client = lambda *a, **k: _DummyClient()

    config_mod = types.ModuleType("chromadb.config")

    class Settings:  # pylint: disable=too-few-public-methods
        def __init__(self, **kwargs):
            pass

    config_mod.Settings = Settings

    sys.modules["chromadb"] = chromadb
    sys.modules["chromadb.config"] = config_mod

from scripts.index_project_files import index_project_files


def test_index_project_files(tmp_path: Path) -> None:
    sample_dir = tmp_path / "sample"
    sample_dir.mkdir()

    (sample_dir / "a.txt").write_text("alpha")
    (sample_dir / "b.txt").write_text("beta")

    count = index_project_files(
        root_dir=str(sample_dir),
        collection_name="test_collection",
        persist_directory=str(tmp_path / "db"),
    )

    assert count == 2
