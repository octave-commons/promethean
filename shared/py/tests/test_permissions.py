# SPDX-License-Identifier: GPL-3.0-only
import pytest

from shared.py.permissions import PermissionLayer


def test_default_allow():
    layer = PermissionLayer()
    assert layer.check("read") is True


def test_set_and_check_rule():
    layer = PermissionLayer()
    layer.set_rule("delete", False)
    layer.set_rule("write", True)
    assert layer.check("write") is True
    assert layer.check("delete") is False
