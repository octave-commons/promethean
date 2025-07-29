import re
import sys
from pathlib import Path

WIKILINK_RE = re.compile(r"\[\[([^\]|]+)(\|([^\]]+))?\]\]")


def convert_wikilinks(path: Path) -> None:
    text = path.read_text(encoding="utf-8")

    def repl(match: re.Match) -> str:
        target = match.group(1)
        alias = match.group(3) or target
        link = target.replace(" ", "%20") + ".md"
        return f"[{alias}]({link})"

    new_text = WIKILINK_RE.sub(repl, text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: convert_wikilinks.py <files>")
        sys.exit(1)

    for file in sys.argv[1:]:
        convert_wikilinks(Path(file))
