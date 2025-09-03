# SPDX-License-Identifier: GPL-3.0-only
"""Common agile status definitions shared by kanban utilities."""

STATUS_ORDER = [
    "#rejected",
    "#ice-box",
    "#incoming",
    "#accepted",
    "#breakdown",
    "#blocked",
    "#ready",
    "#todo",
    "#in-progress",
    "#in-review",
    "#done",
    "#archive",
]

STATUS_SET = set(STATUS_ORDER)

__all__ = ["STATUS_ORDER", "STATUS_SET"]
