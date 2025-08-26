from pathlib import Path

from tests.scripts.utils import load_script_module

kh = load_script_module("kanban_to_hashtags")


def test_parse_board(tmp_path):
    board = tmp_path / "kanban.md"
    tasks_dir = tmp_path / ".." / "tasks"
    tasks_dir.mkdir(parents=True)
    (tasks_dir / "a.md").write_text("content", encoding="utf-8")
    (tasks_dir / "b.md").write_text("content", encoding="utf-8")
    board.write_text(
        "\n".join(
            [
                "## Todo",
                "- [ ] [A](../tasks/a.md)",
                "## In Progress",
                "- [ ] [B](../tasks/b.md)",
            ]
        ),
        encoding="utf-8",
    )
    mapping = kh.parse_board(board)
    assert mapping[(tasks_dir / "a.md").resolve()] == "#todo"
    assert mapping[(tasks_dir / "b.md").resolve()] == "#in-progress"


def test_update_tasks(tmp_path):
    board = tmp_path / "kanban.md"
    tasks_dir = tmp_path / "tasks"
    tasks_dir.mkdir()
    task = tasks_dir / "a.md"
    original = "First line with #todo inside\nSecond line\n#todo\n"
    task.write_text(original, encoding="utf-8")
    board.write_text("## Done\n- [ ] [A](tasks/a.md)\n", encoding="utf-8")
    kh.update_tasks(board)
    updated = task.read_text(encoding="utf-8")
    assert updated.splitlines()[:-1] == original.splitlines()[:-1]
    assert updated.splitlines()[-1] == "#done"
