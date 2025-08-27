"""Tests for ``scripts.kanban.agile_statuses`` and related modules."""

from scripts.kanban import agile_statuses as agile
from scripts.kanban import normalize_statuses as normalize


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
