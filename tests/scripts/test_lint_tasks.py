import subprocess
from pathlib import Path


def run_lint(path: Path):
    return subprocess.run(
        [
            "python",
            "scripts/lint_tasks.py",
            str(path),
        ],
        capture_output=True,
        text=True,
    )


def test_lint_tasks_pass(tmp_path):
    good = tmp_path / "good.md"
    good.write_text(
        "# Description\n\n## Goals\n\n## Requirements\n\n## Subtasks\n\n#Todo\n"
    )
    result = run_lint(tmp_path)
    assert result.returncode == 0


def test_lint_tasks_fail(tmp_path):
    bad = tmp_path / "bad.md"
    bad.write_text("# Description\n\n#Todo\n")
    result = run_lint(tmp_path)
    assert result.returncode != 0
    assert "Missing section" in result.stdout
