from tests.scripts.utils import load_script_module

agile = load_script_module("agile_statuses")


def test_status_order_is_unique_and_matches_set():
    """STATUS_ORDER should contain unique statuses and match STATUS_SET."""
    assert len(agile.STATUS_ORDER) == len(set(agile.STATUS_ORDER))
    assert agile.STATUS_SET == set(agile.STATUS_ORDER)


def test_statuses_have_hashtags_and_expected_order():
    """Every status should start with a hashtag and preserve defined order."""
    for status in agile.STATUS_ORDER:
        assert status.startswith("#")
    # spot-check order: first and last elements
    assert agile.STATUS_ORDER[0] == "#ice-box"
    assert agile.STATUS_ORDER[-1] == "#done"
