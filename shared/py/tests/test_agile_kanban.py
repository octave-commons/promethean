import os
import sys
from pathlib import Path

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

from shared.py.agile.kanban import build_board, collect_tasks, parse_board, set_status


def test_roundtrip(tmp_path: Path) -> None:
    tasks_dir = tmp_path / "tasks"
    tasks_dir.mkdir()
    board_dir = tmp_path / "boards"
    board_dir.mkdir()

    (tasks_dir / "task1.md").write_text("## 🛠️ Task: Example\n#todo\n", encoding="utf-8")
    (tasks_dir / "task2.md").write_text("#in-progress\n", encoding="utf-8")

    tasks = collect_tasks(tasks_dir)
    board_text = build_board(tasks)
    board_path = board_dir / "kanban.md"
    board_path.write_text(board_text, encoding="utf-8")

    mapping = parse_board(board_path)
    assert mapping[tasks_dir / "task1.md"] == "#todo"
    assert mapping[tasks_dir / "task2.md"] == "#in-progress"


def test_set_status(tmp_path: Path) -> None:
    task = tmp_path / "task.md"
    task.write_text("Initial\n#todo\n", encoding="utf-8")
    set_status(task, "#done")
    text = task.read_text(encoding="utf-8")
    assert text.endswith("#done\n")
