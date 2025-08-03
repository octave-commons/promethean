import importlib.util
from pathlib import Path

MODULE_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "scripts"
    / "py"
    / "kanban_to_hashtags.py"
)
spec = importlib.util.spec_from_file_location(
    "kanban_to_hashtags",
    MODULE_PATH,
)
kh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kh)


def test_parse_board(tmp_path):
    board = tmp_path / "kanban.md"
    tasks_dir = tmp_path / ".." / "tasks"
    tasks_dir.mkdir(parents=True)
    (tasks_dir / "a.md").write_text("content", encoding="utf-8")
    (tasks_dir / "b.md").write_text("content", encoding="utf-8")
    board.write_text(
        "\n".join([
            "## Todo",
            "- [ ] [A](../tasks/a.md)",
            "## In Progress",
            "- [ ] [B](../tasks/b.md)",
        ]),
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
    task.write_text("initial", encoding="utf-8")
    board.write_text("## Done\n- [ ] [A](tasks/a.md)", encoding="utf-8")
    kh.update_tasks(board)
    assert task.read_text(encoding="utf-8").strip().splitlines()[-1] == "#done"
