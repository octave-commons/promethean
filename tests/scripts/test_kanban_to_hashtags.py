"""Tests for ``scripts.kanban.kanban_to_hashtags``."""

from scripts.kanban import kanban_to_hashtags as kh


def test_header_to_status_normalization():
    assert kh.header_to_status("🔥 In Progress (3)") == "#in-progress"


def test_sync_board_and_tasks(tmp_path, monkeypatch):
    board = tmp_path / "kanban.md"
    tasks_dir = tmp_path / "tasks"
    tasks_dir.mkdir()
    task = tasks_dir / "a.md"
    task.write_text("first\n#todo\n", encoding="utf-8")
    board.write_text(
        "\n".join(
            [
                "## 🔥 In Progress",
                "- [ ] [A](tasks/a.md) #todo",
            ]
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(kh, "TASK_DIR", tasks_dir)

    original_board = board.read_text(encoding="utf-8")
    changed = kh.sync_board_and_tasks(board, write=False, update_tasks=True)

    assert changed is True
    assert board.read_text(encoding="utf-8") == original_board
    assert task.read_text(encoding="utf-8").splitlines()[-1] == "#in-progress"

    kh.sync_board_and_tasks(board, write=True, update_tasks=False)
    updated_board = board.read_text(encoding="utf-8")
    assert "- [ ] [A](tasks/a.md) #in-progress" in updated_board.splitlines()
    assert "#todo" not in updated_board
