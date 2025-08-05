#!/usr/bin/env python3
"""Compile Hy source files to Python equivalents."""
from pathlib import Path
from hy.compiler import hy_compile
from hy import reader
import astor

HY_FILES = [
    Path("services/py/discord_attachment_indexer/main.hy"),
    Path("services/py/discord_indexer/main.hy"),
    Path("services/py/stt_ws/app.hy"),
    Path("services/py/whisper_stream_ws/app.hy"),
]

for path in HY_FILES:
    src = path.read_text()
    models = reader.read_many(src)
    py_ast = hy_compile(models, "__main__")
    path.with_suffix(".py").write_text(astor.to_source(py_ast))
