"""Utility for appending hashtag metadata to documentation files.

The previous implementation simply slugified each filename which resulted in a
tag per file. That produced an overwhelming and mostly useless tag cloud.  The
new logic groups files into broader thematic categories based on their folder
path.  If a file already contains a ``#tags:`` line it will be replaced with the
new set.
"""

import os
import re
from collections import OrderedDict

ROOT = "docs"

# Mapping of folder prefixes to tag lists.  Keys are checked in order so that
# more specific paths override generic ones.
CATEGORY_MAP = OrderedDict(
    {
        "agile/Tasks": ["#agile", "#task"],
        "agile/boards": ["#agile", "#board"],
        "agile/templates": ["#agile", "#template"],
        "agile": ["#agile"],
        "design/circuits": ["#design", "#circuits"],
        "design/templates": ["#design", "#template"],
        "design": ["#design"],
        "notes/diagrams": ["#notes", "#diagram"],
        "notes/dsl": ["#notes", "#dsl"],
        "notes/math": ["#notes", "#math"],
        "notes/simulation": ["#notes", "#simulation"],
        "notes/templates": ["#notes", "#template"],
        "notes/wm": ["#notes", "#wm"],
        "notes": ["#notes"],
        "research/templates": ["#research", "#template"],
        "research": ["#research"],
        "journal/templates": ["#journal", "#template"],
        "journal": ["#journal"],
        "unique": ["#journal", "#unique"],
        "templates": ["#template"],
    }
)


def determine_tags(relpath: str):
    """Return a list of tags for a given relative path."""
    normalized = relpath.replace(os.sep, "/")
    for prefix, tags in CATEGORY_MAP.items():
        if normalized.startswith(prefix):
            return tags
    # Fallback: use first folder as generic category
    parts = normalized.split("/")
    if len(parts) > 1:
        return [f"#{parts[0].lower()}"]
    return ["#docs"]


tag_line_re = re.compile(r"^#tags:\s*(.*)$", re.MULTILINE)

for dirpath, dirnames, filenames in os.walk(ROOT):
    for filename in filenames:
        if not filename.endswith(".md"):
            continue
        path = os.path.join(dirpath, filename)
        rel = os.path.relpath(path, ROOT)
        tags = determine_tags(rel)

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        if tag_line_re.search(content):
            content = tag_line_re.sub("", content).rstrip()

        new_line = "\n\n#tags: " + " ".join(tags) + "\n"
        with open(path, "w", encoding="utf-8") as f:
            f.write(content.rstrip() + new_line)

        print("Updated tags for", path)
