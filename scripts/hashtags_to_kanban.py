#!/usr/bin/env python3
"""Generate a Kanban board from task status hashtags."""

from shared.py.agile.kanban import build_board, collect_tasks


def main() -> None:
    board = build_board(collect_tasks())
    print(board)


if __name__ == "__main__":
    main()
