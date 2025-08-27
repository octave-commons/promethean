import sys

from tests.scripts.utils import load_script_module, SCRIPTS_DIR

KANBAN_DIR = SCRIPTS_DIR / "kanban"
if str(KANBAN_DIR) not in sys.path:
    sys.path.insert(0, str(KANBAN_DIR))

agile = load_script_module("kanban/agile_statuses")
sys.modules["agile_statuses"] = agile
normalize = load_script_module("kanban/normalize_statuses")


def test_status_order_is_unique_and_matches_set():
    """STATUS_ORDER should contain unique statuses and match STATUS_SET."""
    assert len(agile.STATUS_ORDER) == len(set(agile.STATUS_ORDER))
    assert agile.STATUS_SET == set(agile.STATUS_ORDER)


def test_statuses_have_hashtags_and_expected_order():
    """Every status should start with a hashtag and preserve defined order."""
    for status in agile.STATUS_ORDER:
        assert status.startswith("#")
    # spot-check order: first and last elements
    assert agile.STATUS_ORDER[0] == "#rejected"
    assert agile.STATUS_ORDER[-1] == "#archive"


def test_normalize_statuses_uses_project_status_set():
    """normalize_statuses should use the same STATUS_SET as agile_statuses."""
    assert normalize.STATUS_SET == agile.STATUS_SET
