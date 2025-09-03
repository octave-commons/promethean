# SPDX-License-Identifier: GPL-3.0-only
import scripts.lowercase_links as ll


def test_process_file_renames_dirs_and_links(tmp_path):
    ll.ROOT = tmp_path
    source = tmp_path / "Source"
    source.mkdir()
    (source / "file.md").write_text("content", encoding="utf-8")
    doc = tmp_path / "README.md"
    doc.write_text("See [File](Source/file.md)", encoding="utf-8")
    ll.process_file(doc)
    assert (tmp_path / "source").exists()
    assert not (tmp_path / "Source").exists()
    text = doc.read_text(encoding="utf-8")
    assert "[File](source/file.md)" in text


def test_process_file_lowercases_missing_dirs(tmp_path):
    ll.ROOT = tmp_path
    doc = tmp_path / "README.md"
    doc.write_text("See [File](Missing/file.md)", encoding="utf-8")
    ll.process_file(doc)
    text = doc.read_text(encoding="utf-8")
    assert "[File](missing/file.md)" in text
    assert not (tmp_path / "missing").exists()
