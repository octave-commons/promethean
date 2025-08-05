"""Tests for :mod:`scripts.index_project_files`."""

from pathlib import Path

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

