import importlib
import os
import sys

# Ensure repository root is on the path so `shared` can be imported
sys.path.append(os.getcwd())

permission_gate = importlib.import_module("shared.py.permission_gate")


def test_permission_granted():
    assert permission_gate.check_permission("alice", "read")


def test_permission_denied():
    assert not permission_gate.check_permission("alice", "delete")
