# SPDX-License-Identifier: GPL-3.0-only
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]) if sys.argv[1] else Path(__file__).resolve().parents[1]
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


def rename_dirs(base: Path, link: str) -> None:
    """Rename directories in the link path to lowercase if they exist."""
    if "/" not in link:
        return
    target = (base.parent / link).resolve()
    if not target.exists():
        return
    try:
        rel = target.relative_to(ROOT)
    except ValueError:
        return
    cur = ROOT
    for part in rel.parts[:-1]:
        cur = cur / part
        lower = cur.with_name(cur.name.lower())
        if cur.exists() and cur.name != cur.name.lower():
            if lower.exists():
                print(f"Skipping rename of {cur} -> {lower}: target exists")
            else:
                cur.rename(lower)
                cur = lower
        else:
            cur = lower if cur.name != lower.name else cur


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")

    def repl(match: re.Match) -> str:
        link = match.group(1)
        lower = link.lower()
        if link != lower:
            rename_dirs(path, link)
        return match.group(0).replace(link, lower)

    new_text = LINK_RE.sub(repl, text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")


if __name__ == "__main__":
    files = list(ROOT.rglob("*.md"))
    for f in files:
        process_file(f)
