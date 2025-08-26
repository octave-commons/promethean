import hy  # noqa: F401

import util
from unittest.mock import patch


def test_sh_without_shell_calls_subprocess_run_with_list_and_cwd():
    with patch("util.subprocess.run") as mock_run:
        util.sh(["echo", "hi"], cwd="/tmp")
        mock_run.assert_called_once_with(["echo", "hi"], cwd="/tmp", check=True)


def test_sh_with_shell_true_passes_shell_flag():
    with patch("util.subprocess.run") as mock_run:
        util.sh("echo hi", cwd="/tmp", shell=True)
        mock_run.assert_called_once_with("echo hi", cwd="/tmp", check=True, shell=True)


def test_run_dirs_calls_sh_for_existing_directories(tmp_path):
    existing = tmp_path / "existing"
    existing.mkdir()
    missing = tmp_path / "missing"
    with patch("util.sh") as mock_sh:
        util.run_dirs([str(existing), str(missing)], ["echo", "test"])
        mock_sh.assert_called_once_with(
            ["echo", "test"], cwd=str(existing), shell=False
        )
