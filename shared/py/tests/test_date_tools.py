import os
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

from shared.py.date_tools import time_ago


def test_time_ago_seconds():
    now = datetime(2024, 1, 1, tzinfo=timezone.utc)
    past = now - timedelta(seconds=30)
    assert time_ago(past, now) == "30 seconds ago"


def test_time_ago_minute_singular():
    now = datetime(2024, 1, 1, tzinfo=timezone.utc)
    past = now - timedelta(minutes=1)
    assert time_ago(past, now) == "1 minute ago"


def test_time_ago_hours():
    now = datetime(2024, 1, 1, tzinfo=timezone.utc)
    past = now - timedelta(hours=5)
    assert time_ago(past, now) == "5 hours ago"


def test_time_ago_days():
    now = datetime(2024, 1, 10, tzinfo=timezone.utc)
    past = now - timedelta(days=2)
    assert time_ago(past, now) == "2 days ago"
