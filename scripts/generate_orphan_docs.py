#!/usr/bin/env python3
"""Generate documentation for orphaned files using Ollama.

This script reads the list of orphaned files from ``orphaned-files-report.md``.
For each file that is not already within the ``docs`` directory, a mirrored
markdown file is created under ``docs/``. The contents of the orphaned file are
sent to ``ollama`` to generate concise documentation which is then written to
that mirrored markdown file.
"""

from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

REPORT_FILE = "orphaned-files-report.md"
MODEL = "mistral"
DOCS_DIR = Path("docs")


def read_orphaned_paths(report: Path) -> list[Path]:
    """Parse the orphaned files report and return a list of file paths."""
    paths: list[Path] = []
    pattern = re.compile(r"^- \[(.*?)\]")
    for line in report.read_text(encoding="utf-8", errors="ignore").splitlines():
        match = pattern.match(line.strip())
        if match:
            path_str = match.group(1)
            if not path_str.startswith("docs/"):
                paths.append(Path(path_str))
    return paths


def generate_doc(path: Path, content: str) -> str:
    """Use Ollama to generate documentation for ``path`` based on ``content``."""
    if shutil.which("ollama") is None:
        return ""
    prompt = f"Write concise documentation for the file `{path}`:\n\n{content}\n"
    try:
        result = subprocess.run(
            ["ollama", "run", MODEL],
            input=prompt,
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError:
        return ""
    return result.stdout.strip()


def process_file(path: Path) -> None:
    """Create a mirrored documentation file for ``path`` if needed."""
    doc_path = DOCS_DIR / path
    doc_path = doc_path.with_name(doc_path.name + ".md")
    if doc_path.exists():
        return
    try:
        content = path.read_text(encoding="utf-8")
    except Exception:
        return
    documentation = generate_doc(path, content)
    if not documentation:
        return
    doc_path.parent.mkdir(parents=True, exist_ok=True)
    doc_text = f"# {path}\n\n{documentation}\n"
    doc_path.write_text(doc_text, encoding="utf-8")


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    report_path = repo_root / REPORT_FILE
    if not report_path.exists():
        raise FileNotFoundError(f"{REPORT_FILE} not found")
    for orphan_path in read_orphaned_paths(report_path):
        source_path = repo_root / orphan_path
        if source_path.exists():
            process_file(source_path)


if __name__ == "__main__":
    main()
