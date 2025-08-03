#!/usr/bin/env python3
"""Update task files with status hashtags from the kanban board."""

from shared.py.agile.kanban import update_tasks


def main() -> None:
    update_tasks()


if __name__ == "__main__":
    main()
