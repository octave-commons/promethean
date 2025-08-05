#!/usr/bin/env python3
"""Compile Hy source files in ``services/hy`` to Python equivalents in ``services/py``."""
from pathlib import Path

from hy import reader
from hy.compiler import hy_compile
import astor

HY_ROOT = Path("services/hy")
PY_ROOT = Path("services/py")


for hy_path in HY_ROOT.rglob("*.hy"):
    rel = hy_path.relative_to(HY_ROOT)
    py_path = PY_ROOT / rel.with_suffix(".py")
    py_path.parent.mkdir(parents=True, exist_ok=True)

    src = hy_path.read_text()
    try:
        models = reader.read_many(src)
        py_ast = hy_compile(models, "__main__", filename=str(hy_path))
        py_path.write_text(astor.to_source(py_ast))
    except Exception as exc:
        print(f"Failed to compile {hy_path}: {exc}")
