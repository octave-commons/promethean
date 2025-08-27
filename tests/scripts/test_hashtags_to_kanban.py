import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import kanban.hashtags_to_kanban as hk


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
    board = hk.build_board(
        tasks,
        unlinked={},
        settings_block=None,
        header_labels={},
        wikilinks=True,
        encode_urls=False,
    )
    assert "kanban-plugin: board" in board
    assert "## Todo" in board
    assert "## In Progress" in board
    todo_section = board.split("## Todo")[1].split("##")[0]
    assert "[[a.md|Alpha]]" in todo_section
    in_progress_section = board.split("## In Progress")[1].split("##")[0]
    assert "[[b.md|Beta]]" in in_progress_section
    assert "%% kanban:settings" in board
