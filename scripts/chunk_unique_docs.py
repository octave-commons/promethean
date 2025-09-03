# SPDX-License-Identifier: GPL-3.0-only
import re
from collections import defaultdict
from pathlib import Path

INDEX_PATH = Path("docs/unique/index.md")
CHUNKS_DIR = Path("docs/unique/chunks")

CATEGORY_TITLES = {
    "wm": "Window Management",
    "dsl": "DSL",
    "diagrams": "Diagrams",
    "math": "Math",
    "simulation": "Simulation",
    "shared": "Shared",
    "ops": "Operations",
    "js": "JavaScript",
    "tooling": "Tooling",
    "services": "Services",
}


def parse_index(text: str):
    lines = text.splitlines()
    entries = []
    for line in lines:
        if line.startswith("## Stubs for Duplicates"):
            break
        stripped = line.lstrip()
        if stripped.startswith("- "):
            m = re.search(r"\]\(\.\./notes/([^/]+)/[^)]+\)", stripped)
            if m:
                category = m.group(1)
                entries.append((category, stripped))
    return entries


def build_chunks(entries):
    grouped = defaultdict(list)
    for cat, line in entries:
        grouped[cat].append(line)
    CHUNKS_DIR.mkdir(exist_ok=True)
    for cat, lines in grouped.items():
        title = CATEGORY_TITLES.get(cat, cat.title())
        chunk_path = CHUNKS_DIR / f"{cat}.md"
        with chunk_path.open("w", encoding="utf-8") as f:
            f.write(f"# {title}\n\n")
            for ln in lines:
                f.write(f"{ln}\n")


def rewrite_index(text: str, categories):
    start_lines = []
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if line.startswith("- "):
            break
        start_lines.append(line)
    # find tags line to append rest
    tags_index = lines.index("#tags: #unique #index")
    end_lines = lines[tags_index:]
    # build category list
    category_lines = ["## Chunks"]
    for cat in categories:
        title = CATEGORY_TITLES.get(cat, cat.title())
        category_lines.append(f"- [{title}](chunks/{cat}.md)")
    new_content = "\n".join(start_lines + [""] + category_lines + [""] + end_lines)
    return new_content


def main():
    text = INDEX_PATH.read_text(encoding="utf-8")
    entries = parse_index(text)
    build_chunks(entries)
    categories = sorted({cat for cat, _ in entries})
    new_index = rewrite_index(text, categories)
    INDEX_PATH.write_text(new_index, encoding="utf-8")


if __name__ == "__main__":
    main()
