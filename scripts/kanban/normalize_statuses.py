#!/usr/bin/env python3
"""
Enforce a single canonical status hashtag per task file.

- Keeps one "winning" tag (default: last occurrence in the file, matching generator behavior).
- Removes all other known status tags across the file.
- Canonicalizes case/underscores to lowercase + hyphen (e.g., #In_Review -> #in-review).
- Skips fenced code blocks (``` ... ```).
- Dry run by default; --write to apply; --check to fail CI if changes would be made.

Usage:
  python3 scripts/kanban/enforce_single_status.py           # dry-run
  python3 scripts/kanban/enforce_single_status.py --write   # apply fixes
  python3 scripts/kanban/enforce_single_status.py --check   # exit 1 if changes needed
  python3 scripts/kanban/enforce_single_status.py --winner first
  python3 scripts/kanban/enforce_single_status.py --prefer in-review
"""

from __future__ import annotations
import argparse
import re
from pathlib import Path
from typing import Iterable, List, Tuple, Optional

from agile_statuses import STATUS_SET as PROJECT_STATUS_SET  # type: ignore

TASK_DIR = Path("docs/agile/tasks")


def _norm_tag(s: str) -> str:
    s = s.strip()
    if s.startswith("#"):
        s = s[1:]
    return f"#{s.replace('_', '-').lower()}"


STATUS_SET = {_norm_tag(t) for t in PROJECT_STATUS_SET}

TAG_RE = re.compile(r"(?<![\w\]\)])#([A-Za-z0-9_-]+)\b")  # not after word/]/)
FENCE_RE = re.compile(r"^\s*```")  # code fence toggler


def find_all_tags(lines: List[str]) -> List[Tuple[int, Tuple[int, int], str, str]]:
    """
    Return list of (line_idx, (start,end), canon_tag, raw_token)
    Only outside fenced code blocks.
    """
    out = []
    in_fence = False
    for i, raw in enumerate(lines):
        line = raw
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        for m in TAG_RE.finditer(line):
            raw_tok = m.group(0)
            canon = _norm_tag(m.group(1))
            if canon in STATUS_SET:
                out.append((i, (m.start(), m.end()), canon, raw_tok))
    return out


def enforce_single(
    lines: List[str], winner_policy: str = "last", prefer: Optional[str] = None
) -> Tuple[bool, List[str]]:
    """
    Returns (changed?, new_lines) with only one winning status tag retained in the file.
    winner_policy: "last" (default) or "first"
    prefer: e.g., "in-review" -> keep #in-review if present; fallback to policy
    """
    matches = find_all_tags(lines)
    if not matches:
        return (False, lines)

    preferred = _norm_tag(prefer) if prefer else None
    winner_idx = None

    if preferred:
        for idx, (_, _, canon, _) in enumerate(matches):
            if canon == preferred:
                winner_idx = idx
        # if prefer given but not present, fall through to policy

    if winner_idx is None:
        if winner_policy == "first":
            winner_idx = 0
        else:
            winner_idx = len(matches) - 1  # last

    # Build a set of positions (line_idx, start,end) to remove
    keep_line, keep_span = matches[winner_idx][0], matches[winner_idx][1]
    to_remove = []
    for idx, (li, span, canon, raw_tok) in enumerate(matches):
        if idx == winner_idx:
            continue
        to_remove.append((li, span))

    if not to_remove:
        # Already a single tag; still normalize its token to canonical form
        li, (s, e), canon, raw = matches[winner_idx]
        if raw != canon:
            new_lines = lines.copy()
            new_lines[li] = new_lines[li][:s] + canon + new_lines[li][e:]
            return (True, new_lines)
        return (False, lines)

    # Apply removals line-by-line from right to left to preserve indices
    new_lines = lines.copy()
    changed = False

    # Group removals per line
    per_line: dict[int, List[Tuple[int, int]]] = {}
    for li, (s, e) in to_remove:
        per_line.setdefault(li, []).append((s, e))

    for li, spans in per_line.items():
        spans.sort(reverse=True)  # right-to-left
        line = new_lines[li]
        for s, e in spans:
            line = line[:s] + line[e:]
            changed = True
        # collapse double spaces created by deletions
        line = re.sub(r"[ \t]{2,}", " ", line)
        line = re.sub(r"\s+\n$", "\n", line)
        new_lines[li] = line

    # Also canonicalize the kept token if needed
    kli, (ks, ke), kcanon, kraw = matches[winner_idx]
    if kcanon != kraw:
        line = new_lines[kli]
        line = line[:ks] + kcanon + line[ke:]
        new_lines[kli] = line
        changed = True

    return (changed, new_lines)


def iter_task_files(root: Path) -> Iterable[Path]:
    yield from sorted(root.glob("*.md"))


def process_file(path: Path, winner: str, prefer: Optional[str]) -> Tuple[bool, str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    changed, new_lines = enforce_single(lines, winner_policy=winner, prefer=prefer)
    return changed, "".join(new_lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="Apply in place")
    ap.add_argument(
        "--check", action="store_true", help="Exit nonzero if changes would be made"
    )
    ap.add_argument(
        "--dir",
        type=Path,
        default=TASK_DIR,
        help="Tasks directory (default: docs/agile/tasks)",
    )
    ap.add_argument(
        "--winner",
        choices=["first", "last"],
        default="last",
        help="Which tag wins if multiple (default: last)",
    )
    ap.add_argument(
        "--prefer",
        type=str,
        help="Prefer a specific tag if present (e.g., 'in-review')",
    )
    args = ap.parse_args()

    prefer = args.prefer.strip() if args.prefer else None
    tasks = list(iter_task_files(args.dir))
    if not tasks:
        print(f"No markdown tasks under {args.dir}")
        return

    pending: list[Tuple[Path, str]] = []
    for f in tasks:
        changed, new_text = process_file(f, winner=args.winner, prefer=prefer)
        if changed:
            pending.append((f, new_text))

    if not pending:
        print("All tasks already have a single canonical status. ✅")
        return

    print(f"{len(pending)} file(s) will be normalized to a single status tag:")
    for f, _ in pending:
        print(f"  • {f}")

    if args.check:
        raise SystemExit(1)

    if args.write:
        for f, txt in pending:
            f.write_text(txt, encoding="utf-8")
        print("Applied. ✨")
    else:
        print("\n(Dry run) Re-run with --write to apply.")


if __name__ == "__main__":
    main()
