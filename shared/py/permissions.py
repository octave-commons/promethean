"""Permission gating layer (Dorian).

This module provides a simple in-memory permission layer used by the
Promethean framework to check whether a given action is allowed. It
represents the beginnings of Circuit 2: Dorian, which governs access and
trust boundaries.
"""

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class PermissionRule:
    """Represents a single permission rule for an action."""

    action: str
    allowed: bool


@dataclass
class PermissionLayer:
    """In-memory permission store with default-allow semantics."""

    rules: Dict[str, PermissionRule] = field(default_factory=dict)

    def set_rule(self, action: str, allowed: bool) -> None:
        """Add or update a permission rule."""

        self.rules[action] = PermissionRule(action, allowed)

    def check(self, action: str) -> bool:
        """Return True if the action is permitted.

        If no rule exists for the action, the layer defaults to allowing it.
        """

        rule = self.rules.get(action)
        return rule.allowed if rule else True
