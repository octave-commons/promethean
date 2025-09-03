# SPDX-License-Identifier: GPL-3.0-only
from datetime import datetime, timezone, timedelta

from shared.py.date_tools import time_ago


def test_seconds_ago():
    now = datetime(2024, 1, 1, tzinfo=timezone.utc)
    past = now - timedelta(seconds=5)
    assert time_ago(past, now) == "5 seconds ago"


def test_single_minute_ago():
    now = datetime(2024, 1, 1, tzinfo=timezone.utc)
    past = now - timedelta(minutes=1)
    assert time_ago(past, now) == "1 minute ago"


def test_hours_ago():
    now = datetime(2024, 1, 1, 12, tzinfo=timezone.utc)
    past = now - timedelta(hours=3)
    assert time_ago(past, now) == "3 hours ago"


def test_days_ago():
    now = datetime(2024, 1, 10, tzinfo=timezone.utc)
    past = now - timedelta(days=2)
    assert time_ago(past, now) == "2 days ago"


def test_single_second_ago_default_now():
    """Ensure singular seconds are handled when ``now`` is omitted."""
    past = datetime.now(timezone.utc) - timedelta(seconds=1)
    assert time_ago(past) == "1 second ago"


def test_single_hour_ago():
    now = datetime(2024, 1, 1, tzinfo=timezone.utc)
    past = now - timedelta(hours=1)
    assert time_ago(past, now) == "1 hour ago"


def test_single_day_ago():
    now = datetime(2024, 1, 2, tzinfo=timezone.utc)
    past = now - timedelta(days=1)
    assert time_ago(past, now) == "1 day ago"
