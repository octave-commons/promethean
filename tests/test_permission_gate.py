import importlib
import pytest

permission_gate = importlib.import_module("shared.py.permission_gate")


def test_permission_granted():
    assert permission_gate.check_permission("alice", "read")


def test_permission_denied():
    assert not permission_gate.check_permission("alice", "delete")


def test_sigmoid_midpoint():
    """The sigmoid function should be centered at zero."""
    assert permission_gate._sigmoid(0) == pytest.approx(0.5)


def test_custom_config_path(tmp_path):
    """A custom config path should influence permission decisions."""
    # Config allowing the action
    allow_cfg = tmp_path / "allow.yaml"
    allow_cfg.write_text(
        """
beta: 1.0
default:
  threshold: 0
  weights:
    trust: 1
  actions:
    default:
      features:
        trust: 1
"""
    )

    permission_gate._CONFIG_CACHE = None
    assert permission_gate.check_permission("bob", "read", config_path=str(allow_cfg))

    # Config denying the action
    deny_cfg = tmp_path / "deny.yaml"
    deny_cfg.write_text(
        """
beta: 1.0
default:
  threshold: 1
  weights:
    trust: 1
  actions:
    default:
      features:
        trust: 0
"""
    )

    permission_gate._CONFIG_CACHE = None
    assert not permission_gate.check_permission(
        "bob", "read", config_path=str(deny_cfg)
    )
