import importlib.util
from pathlib import Path

MODULE_PATH = (
    Path(__file__).resolve().parent.parent
    / "scripts"
    / "hashtags_to_kanban.py"
)
spec = importlib.util.spec_from_file_location(
    "hashtags_to_kanban",
    MODULE_PATH,
)
hk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hk)


def test_parse_task_with_status(tmp_path):
    md = tmp_path / "task.md"
    md.write_text(
        "## 🛠️ Task: Sample\nSome notes #in-progress\n",
        encoding="utf-8",
    )
    title, status = hk.parse_task(md)
    assert title == "Sample"
    assert status == "#in-progress"


def test_parse_task_defaults_to_todo(tmp_path):
    md = tmp_path / "task2.md"
    md.write_text(
        "## 🛠️ Task: Another\nNo status here\n",
        encoding="utf-8",
    )
    title, status = hk.parse_task(md)
    assert title == "Another"
    assert status == "#todo"


def test_build_board_groups_by_status(tmp_path):
    t1 = tmp_path / "a.md"
    t1.write_text("## 🛠️ Task: Alpha\n#todo\n", encoding="utf-8")
    t2 = tmp_path / "b.md"
    t2.write_text("## 🛠️ Task: Beta\n#in-progress\n", encoding="utf-8")
    tasks = hk.collect_tasks(tmp_path)
    board = hk.build_board(tasks)
    assert "## Todo" in board
    assert "## In Progress" in board
    todo_section = board.split("## Todo")[1].split("##")[0]
    assert "[Alpha]" in todo_section
    in_progress_section = board.split("## In Progress")[1].split("##")[0]
    assert "[Beta]" in in_progress_section
