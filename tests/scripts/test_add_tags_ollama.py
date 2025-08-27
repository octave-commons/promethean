"""Tests for :mod:`scripts.add_tags_ollama`."""

import shutil
import subprocess
import types

import scripts.add_tags_ollama as add_tags


def test_generate_tags_success(monkeypatch):
    """generate_tags should return hashtags when the CLI call succeeds."""

    monkeypatch.setattr(shutil, "which", lambda cmd: "/usr/bin/ollama")

    def fake_run(cmd, *, input, capture_output, text, check):
        return types.SimpleNamespace(stdout="#one #two #three")

    monkeypatch.setattr(subprocess, "run", fake_run)

    tags = add_tags.generate_tags("content")
    assert tags == "#one #two #three"
    assert all(tag.startswith("#") for tag in tags.split())


def test_generate_tags_missing_cli(monkeypatch):
    """generate_tags returns an empty string when ollama is not installed."""

    monkeypatch.setattr(shutil, "which", lambda cmd: None)
    assert add_tags.generate_tags("content") == ""


def test_generate_tags_subprocess_failure(monkeypatch):
    """generate_tags returns an empty string when ollama run fails."""

    monkeypatch.setattr(shutil, "which", lambda cmd: "/usr/bin/ollama")

    def fake_run(cmd, *, input, capture_output, text, check):
        raise subprocess.CalledProcessError(returncode=1, cmd=cmd)

    monkeypatch.setattr(subprocess, "run", fake_run)
    assert add_tags.generate_tags("content") == ""


def test_process_file_appends_tags(tmp_path, monkeypatch):
    """process_file appends generated tags to markdown files."""

    file_path = tmp_path / "doc.md"
    file_path.write_text("Hello\n", encoding="utf-8")

    monkeypatch.setattr(add_tags, "generate_tags", lambda content: "#alpha #beta")
    add_tags.process_file(file_path)

    assert file_path.read_text(encoding="utf-8").splitlines() == [
        "Hello",
        "#alpha #beta",
    ]


def test_process_file_replaces_existing_tags(tmp_path, monkeypatch):
    """Existing tag line is replaced with newly generated tags."""

    file_path = tmp_path / "doc.md"
    file_path.write_text("Hello\n#old\n", encoding="utf-8")

    monkeypatch.setattr(add_tags, "generate_tags", lambda content: "#new")
    add_tags.process_file(file_path)

    assert file_path.read_text(encoding="utf-8").splitlines() == ["Hello", "#new"]
