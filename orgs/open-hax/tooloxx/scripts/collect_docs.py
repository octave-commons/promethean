#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

TOOLOXX_ROOT = Path(__file__).resolve().parent.parent
DEVEL_ROOT = TOOLOXX_ROOT.parent.parent.parent
PROMETHEAN_ROOT = DEVEL_ROOT / "orgs" / "octave-commons" / "promethean"
IMPORT_ROOT = TOOLOXX_ROOT / "docs" / "imports"

EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "coverage",
    ".next",
    ".nx",
    ".scannerwork",
    ".cpcache",
    ".shadow-cljs",
    ".serena",
    ".pytest_cache",
    "__pycache__",
    ".ημ",
    ".Π",
}
DOC_SUFFIXES = {".md", ".mdx", ".org", ".txt", ".adoc", ".rst"}
DEVEL_DOC_ROOTS = [
    DEVEL_ROOT / "docs",
    DEVEL_ROOT / "spec",
    DEVEL_ROOT / "specs",
    DEVEL_ROOT / "services" / "mcp-stack" / "README.md",
    DEVEL_ROOT / "services" / "radar-stack" / "README.md",
]
PROMETHEAN_DOC_ROOTS = [
    PROMETHEAN_ROOT / "docs",
    PROMETHEAN_ROOT / "spec",
    PROMETHEAN_ROOT / "services",
]


@dataclass
class CopyStats:
    files: int = 0


def reset_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def iter_doc_files(root: Path):
    if not root.exists():
        return
    if root.is_file():
        if root.suffix.lower() in DOC_SUFFIXES or root.name in {"README.md", "AGENTS.md"}:
            yield root
        return
    for path in root.rglob("*"):
        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in DOC_SUFFIXES:
            yield path


def copy_file(src: Path, dest_root: Path, relative_to: Path, stats: CopyStats) -> None:
    rel = src.relative_to(relative_to)
    dest = dest_root / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    stats.files += 1


def keep_devel_doc(path: Path) -> bool:
    lower = path.as_posix().lower()
    tokens = (
        "mcp",
        "tooloxx",
        "hormuz-clock-mcp",
        "threat-radar-mcp",
        "mcp-stack",
        "radar-stack",
    )
    return any(token in lower for token in tokens)


def keep_promethean_doc(path: Path) -> bool:
    lower = path.as_posix().lower()
    return (
        "/services/mcp" in lower
        or "/docs/dev/packages/mcp" in lower
        or "/docs/dev/security/mcp_" in lower
        or "/docs/design/enso-protocol/08-mcp-integration" in lower
        or "/docs/dev/mcp-config-loader" in lower
        or ("/spec/" in lower and "mcp" in lower)
        or ("/docs/agile/tasks/" in lower and "mcp" in lower)
    )


def main() -> None:
    devel_dest = IMPORT_ROOT / "devel-root"
    promethean_dest = IMPORT_ROOT / "promethean"
    reset_dir(devel_dest)
    reset_dir(promethean_dest)

    devel_stats = CopyStats()
    prom_stats = CopyStats()

    seen: set[Path] = set()
    for root in DEVEL_DOC_ROOTS:
        for src in iter_doc_files(root):
            if not keep_devel_doc(src):
                continue
            if src in seen:
                continue
            seen.add(src)
            copy_file(src, devel_dest, DEVEL_ROOT, devel_stats)

    seen.clear()
    for root in PROMETHEAN_DOC_ROOTS:
        for src in iter_doc_files(root):
            if not keep_promethean_doc(src):
                continue
            if src in seen:
                continue
            seen.add(src)
            copy_file(src, promethean_dest, PROMETHEAN_ROOT, prom_stats)

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "tooloxxRoot": str(TOOLOXX_ROOT),
        "scope": "MCP server documentation only",
        "sources": {
            "develRoot": str(DEVEL_ROOT),
            "prometheanRoot": str(PROMETHEAN_ROOT),
        },
        "excludedDirs": sorted(EXCLUDED_DIRS),
        "imports": {
            "devel-root": {
                "destination": str(devel_dest.relative_to(TOOLOXX_ROOT)),
                "files": devel_stats.files,
                "selectionRule": "doc files in devel root surfaces whose paths explicitly target MCP/tooloxx/radar-stack MCP surfaces",
            },
            "promethean": {
                "destination": str(promethean_dest.relative_to(TOOLOXX_ROOT)),
                "files": prom_stats.files,
                "selectionRule": "doc files in Promethean docs/spec/services paths explicitly tied to MCP services, MCP package docs, or MCP security/config docs",
            },
        },
    }
    manifest_path = IMPORT_ROOT / "MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
