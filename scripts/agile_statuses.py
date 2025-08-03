"""Common agile status definitions shared by kanban utilities."""

STATUS_ORDER = [
    "#ice-box",
    "#incoming",
    "#rejected",
    "#accepted",
    "#prompt-refinement",
    "#agent-thinking",
    "#breakdown",
    "#blocked",
    "#ready",
    "#todo",
    "#in-progress",
    "#in-review",
    "#done",
]

STATUS_SET = set(STATUS_ORDER)

__all__ = ["STATUS_ORDER", "STATUS_SET"]
