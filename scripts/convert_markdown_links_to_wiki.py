#!/usr/bin/env python3
"""
Convert Markdown links [title](path/to/Note.md#frag) to Obsidian wikilinks [[Note.md|title]] (or [[Note#frag|title]]).

- Skips external URLs (http/https/mailto/etc.)
- Skips images ![alt](...)
- Preserves anchors (#heading / ^block)
- Works across a directory tree; safe dry-run by default
- Avoids code fences (``` blocks) so code snippets aren't modified

Examples
--------
# Single file (write in place)
python scripts/md_links_to_wikilinks.py docs/agile/boards/kanban.md --write

# Entire repo/vault, preview diffs then write
python scripts/md_links_to_wikilinks.py --root . --diff
python scripts/md_links_to_wikilinks.py --root . --write --backup-ext .bak

# Prefer wikilinks without .md extension
python scripts/md_links_to_wikilinks.py --root . --write --drop-ext

# Always include alias (title) even if it matches filename
python scripts/md_links_to_wikilinks.py --root . --write --always-alias
"""
from __future__ import annotations

import argparse
import difflib
import re
import sys
from pathlib import Path
from typing import Iterable, Tuple
from urllib.parse import unquote, urlparse

# Match regular Markdown links that are NOT images.
# [text](url "optional title")
MD_LINK_RE = re.compile(
    r"(?<!\!)\[(?P<text>[^\]]+)\]\((?P<url>[^)\s]+)(?:\s+\"(?P<title>[^\"]*)\")?\)"
)

# Fenced code block delimiter (``` language?)
FENCE_RE = re.compile(r"^\s*```")

# Protocols to leave untouched
EXTERNAL_SCHEMES = ("http:", "https:", "mailto:", "ftp:", "file:")


def is_external(href: str) -> bool:
    href_l = href.lower()
    if href_l.startswith(EXTERNAL_SCHEMES):
        return True
    # anchor-only link (same-document) -> keep as-is
    if href_l.startswith("#"):
        return True
    return False


def to_wikilink(
    href: str, text: str, *, drop_ext: bool, always_alias: bool
) -> str | None:
    """Return wikilink string for a local href, or None if it shouldn't be converted."""
    # Decode percent-encoding
    href_dec = unquote(href)

    # Split off fragment (e.g., Note.md#Some Heading)
    parsed = urlparse(href_dec)
    path = parsed.path
    frag = parsed.fragment

    # Only handle local note-like targets
    if not path:
        return None

    name = Path(path).name  # just the file name (Obsidian resolves vault-wide)

    # Optionally drop the .md extension in wiki links
    if drop_ext and name.lower().endswith(".md"):
        display = name[:-3]
    else:
        display = name

    # Add fragment back (Obsidian wiki-anchors use the same syntax after #)
    if frag:
        display = f"{display}#{frag}"

    # Decide if we need an alias (pipe)
    norm_text = text.strip()
    # Compare against filename text without extension (rough heuristic)
    base_no_ext = name[:-3] if name.lower().endswith(".md") else name
    if always_alias or norm_text and norm_text != base_no_ext:
        return f"[[{display}|{norm_text}]]"
    else:
        return f"[[{display}]]"


def convert_line(line: str, *, drop_ext: bool, always_alias: bool) -> str:
    def repl(m: re.Match[str]) -> str:
        text = m.group("text")
        href = m.group("url")
        # Leave external links alone
        if is_external(href):
            return m.group(0)
        w = to_wikilink(href, text, drop_ext=drop_ext, always_alias=always_alias)
        return w if w else m.group(0)

    return MD_LINK_RE.sub(repl, line)


def convert_text(text: str, *, drop_ext: bool, always_alias: bool) -> str:
    """Convert MD links to wikilinks, skipping fenced code blocks."""
    out_lines = []
    in_fence = False
    for line in text.splitlines(keepends=False):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            out_lines.append(line)
            continue
        if in_fence:
            out_lines.append(line)
            continue
        out_lines.append(
            convert_line(line, drop_ext=drop_ext, always_alias=always_alias)
        )
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def iter_markdown_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*.md"):
        if p.is_file():
            yield p


def process_file(
    path: Path,
    *,
    write: bool,
    drop_ext: bool,
    always_alias: bool,
    backup_ext: str | None,
    show_diff: bool,
) -> Tuple[bool, str]:
    original = path.read_text(encoding="utf-8")
    converted = convert_text(original, drop_ext=drop_ext, always_alias=always_alias)
    changed = original != converted

    if show_diff and changed:
        diff = difflib.unified_diff(
            original.splitlines(),
            converted.splitlines(),
            fromfile=str(path),
            tofile=f"{path} (wikilinks)",
            lineterm="",
        )
        print("\n".join(diff))

    if write and changed:
        if backup_ext:
            backup_path = path.with_suffix(path.suffix + backup_ext)
            backup_path.write_text(original, encoding="utf-8")
        path.write_text(converted, encoding="utf-8")

    return changed, ("written" if write and changed else "unchanged")


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Convert Markdown links to Obsidian wikilinks across a vault or file."
    )
    ap.add_argument(
        "paths",
        nargs="*",
        type=Path,
        help="Specific files or directories to process. If empty, uses --root.",
    )
    ap.add_argument(
        "--root",
        type=Path,
        default=Path("."),
        help="Root directory to scan when no explicit paths are provided.",
    )
    ap.add_argument("--write", action="store_true", help="Write changes in-place.")
    ap.add_argument(
        "--drop-ext", action="store_true", help="Emit wikilinks without .md extension."
    )
    ap.add_argument(
        "--always-alias",
        action="store_true",
        help="Always include '|title' even if it matches filename.",
    )
    ap.add_argument(
        "--backup-ext",
        default=".bak",
        help="Backup extension when writing (set empty string to disable).",
    )
    ap.add_argument(
        "--diff", action="store_true", help="Show unified diff for changes."
    )
    args = ap.parse_args()

    targets: list[Path] = []
    if args.paths:
        for p in args.paths:
            if p.is_dir():
                targets.extend(iter_markdown_files(p))
            elif p.is_file():
                targets.append(p)
            else:
                print(f"warning: {p} not found", file=sys.stderr)
    else:
        root = args.root
        if root.is_dir():
            targets = list(iter_markdown_files(root))
        elif root.is_file():
            targets = [root]
        else:
            print(f"error: root {root} not found", file=sys.stderr)
            sys.exit(2)

    changed_any = False
    for path in sorted(set(targets)):
        changed, status = process_file(
            path,
            write=args.write,
            drop_ext=args.drop_ext,
            always_alias=args.always_alias,
            backup_ext=None if args.backup_ext == "" else args.backup_ext,
            show_diff=args.diff,
        )
        if changed:
            changed_any = True
        if not args.diff:
            print(f"{path}: {status}")

    if changed_any and not args.write:
        print("\n(dry-run) Changes detected. Re-run with --write to apply.")


if __name__ == "__main__":
    main()
