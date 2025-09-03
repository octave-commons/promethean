# SPDX-License-Identifier: GPL-3.0-only
"""Date and time helpers for shared utilities."""

from datetime import datetime, timezone
from typing import Optional


def time_ago(past: datetime, now: Optional[datetime] = None) -> str:
    """Return a human-friendly relative time string.

    Parameters
    ----------
    past : datetime
        The past moment to compare against ``now``.
    now : datetime, optional
        Reference time. Defaults to the current UTC time if not provided.

    Returns
    -------
    str
        A description like ``"5 minutes ago"`` or ``"2 days ago"``.
    """

    if now is None:
        now = datetime.now(timezone.utc)
    delta = now - past

    seconds = int(delta.total_seconds())
    minutes = seconds // 60
    hours = minutes // 60
    days = delta.days

    if seconds < 60:
        return f"{seconds} second{'s' if seconds != 1 else ''} ago"
    elif minutes < 60:
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif hours < 24:
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    else:
        return f"{days} day{'s' if days != 1 else ''} ago"
