from __future__ import annotations

import subprocess
from pathlib import Path

import scripts.generate_service_templates as gst


def test_python_scaffold_compiles(tmp_path: Path) -> None:
    target = tmp_path / "py_service"
    gst.generate_scaffold(target, "python")
    assert (target / "src").is_dir()
    assert (target / "tests").is_dir()
    subprocess.run(
        ["python", "-m", "py_compile", str(target / "src" / "__init__.py")], check=True
    )


def test_typescript_scaffold_typechecks(tmp_path: Path) -> None:
    target = tmp_path / "ts_service"
    gst.generate_scaffold(target, "typescript")
    assert (target / "src").is_dir()
    assert (target / "package.json").exists()
    subprocess.run(
        [
            "pnpm",
            "exec",
            "tsc",
            "--project",
            str(target / "tsconfig.json"),
            "--noEmit",
        ],
        check=True,
    )
