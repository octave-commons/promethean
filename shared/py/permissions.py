"""Back-compat shim for permissions module.

Re-exports from core.permissions to satisfy legacy imports:
  `from shared.py.permissions import PermissionLayer, PermissionRule, check_permission`
"""

from .core.permissions import PermissionLayer, PermissionRule, check_permission

__all__ = ["PermissionLayer", "PermissionRule", "check_permission"]
