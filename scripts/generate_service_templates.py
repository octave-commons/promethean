#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Generate service scaffolding and README templates.

This script previously generated README templates from existing services.
It now also supports creating boilerplate directories for new services in
either Python or TypeScript.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parents[1]
SERVICES_DIR = ROOT / "services"
TEMPLATE_DIR = SERVICES_DIR / "templates"


def generate_templates() -> None:
    """Generate README templates from existing service READMEs."""
    TEMPLATE_DIR.mkdir(exist_ok=True)
    for readme in SERVICES_DIR.glob("*/*/README.md"):
        lines = readme.read_text().splitlines()
        if lines and lines[0].startswith("#"):
            lines[0] = "# {{SERVICE_NAME}} Service"
        template_path = TEMPLATE_DIR / f"{readme.parent.name}_README.template.md"
        template_path.write_text("\n".join(lines) + "\n")


def generate_scaffold(target: pathlib.Path, language: str) -> None:
    """Create boilerplate project structure for ``language`` at ``target``."""
    target.mkdir(parents=True, exist_ok=True)
    src = target / "src"
    tests = target / "tests"
    src.mkdir(exist_ok=True)
    tests.mkdir(exist_ok=True)

    if language == "python":
        (src / "__init__.py").write_text("\n")
        (tests / "test_basic.py").write_text(
            "def test_placeholder():\n    assert True\n"
        )
        (target / "Dockerfile").write_text(
            "FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\n"
        )
        (target / "pyproject.toml").write_text(
            f'[project]\nname = "{target.name}"\nversion = "0.1.0"\n'
        )
    elif language == "typescript":
        (src / "index.ts").write_text("console.log('hello');\n")
        (tests / "basic.test.ts").write_text(
            "test('placeholder', () => {\n  expect(true).toBe(true);\n});\n"
        )
        (target / "Dockerfile").write_text("FROM node:20\nWORKDIR /app\nCOPY . .\n")
        package_json = {
            "name": target.name,
            "version": "0.1.0",
            "type": "module",
            "scripts": {"build": "tsc", "lint": "eslint ."},
        }
        (target / "package.json").write_text(json.dumps(package_json, indent=2) + "\n")
        tsconfig = {
            "compilerOptions": {
                "target": "ES2020",
                "module": "ESNext",
                "outDir": "dist",
            },
            "include": ["src"],
        }
        (target / "tsconfig.json").write_text(json.dumps(tsconfig, indent=2) + "\n")
        biome_base = ROOT / "templates" / "ts" / "biome.base.json"
        shutil.copy(biome_base, target / "biome.json")
    else:
        raise ValueError(f"Unsupported language: {language}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("readme", help="Generate README templates from services")

    scaffold = sub.add_parser("scaffold", help="Generate service boilerplate")
    scaffold.add_argument("path", type=pathlib.Path, help="Target directory")
    lang = scaffold.add_mutually_exclusive_group(required=True)
    lang.add_argument("--python", action="store_true", help="Generate Python template")
    lang.add_argument(
        "--typescript", action="store_true", help="Generate TypeScript template"
    )

    args = parser.parse_args()
    if args.command == "readme" or args.command is None:
        generate_templates()
    elif args.command == "scaffold":
        language = "python" if args.python else "typescript"
        generate_scaffold(args.path, language)


if __name__ == "__main__":
    main()
