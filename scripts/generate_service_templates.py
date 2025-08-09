#!/usr/bin/env python3
"""Generate README templates from existing service READMEs.

Scans service directories under ``services/`` for ``README.md`` files and
creates templated copies with the heading replaced by ``{{SERVICE_NAME}}``.
Templates are written to ``services/templates``.
"""
from __future__ import annotations

import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SERVICES_DIR = ROOT / "services"
TEMPLATE_DIR = SERVICES_DIR / "templates"


def generate_templates() -> None:
    TEMPLATE_DIR.mkdir(exist_ok=True)
    for readme in SERVICES_DIR.glob("*/*/README.md"):
        service_dir = readme.parent
        service_slug = service_dir.name
        service_title = service_slug.replace("_", " ").title()

        lines = readme.read_text().splitlines()
        if lines and lines[0].startswith("#"):
            lines[0] = "# {{SERVICE_NAME}} Service"
        template_path = TEMPLATE_DIR / f"{service_slug}_README.template.md"
        template_path.write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    generate_templates()
