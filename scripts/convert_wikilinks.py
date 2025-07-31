"""Convert Obsidian style wikilinks to normal markdown links."""

import re
import sys
from pathlib import Path

WIKILINK_RE = re.compile(r"\[\[([^\]|]+)(\|([^\]]+))?\]\]")


def convert_wikilinks(path: Path) -> None:
    """Rewrite wikilinks inside ``path`` in place."""
    text = path.read_text(encoding="utf-8")

    def repl(match: re.Match) -> str:
        target = match.group(1)
        alias = match.group(3) or target
        link = target.replace(" ", "%20") + ".md"
        return f"[{alias}]({link})"

    new_text = WIKILINK_RE.sub(repl, text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")


def iter_md_files(paths: list[Path]):
    for p in paths:
        if p.is_dir():
            yield from p.rglob("*.md")
        else:
            yield p


if __name__ == "__main__":
    targets = [Path(p) for p in sys.argv[1:]] or [Path("docs")]
    for path in iter_md_files(targets):
        convert_wikilinks(path)
