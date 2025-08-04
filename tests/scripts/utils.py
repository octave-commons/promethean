"""Utilities for loading script modules for testing."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = ROOT / "scripts"


def load_script_module(name: str):
    """Load a module from the ``scripts`` package by name."""
    if "scripts" not in sys.modules:
        pkg_spec = spec_from_file_location("scripts", SCRIPTS_DIR / "__init__.py")
        pkg = module_from_spec(pkg_spec)
        assert pkg_spec.loader is not None
        pkg_spec.loader.exec_module(pkg)  # type: ignore[attr-defined]
        sys.modules["scripts"] = pkg
        sys.path.insert(0, str(SCRIPTS_DIR))
    path = SCRIPTS_DIR / f"{name}.py"
    spec = spec_from_file_location(f"scripts.{name}", path)
    module = module_from_spec(spec)
    sys.modules[spec.name] = module
    assert spec.loader is not None
    spec.loader.exec_module(module)  # type: ignore[attr-defined]
    return module
