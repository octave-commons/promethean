import importlib

import pytest


def reload_settings():
    """Import and reload the settings module to apply environment changes."""
    import shared.py.settings as settings

    return importlib.reload(settings)


def test_defaults(monkeypatch):
    """Defaults apply when environment variables are absent."""
    monkeypatch.delenv("AGENT_NAME", raising=False)
    monkeypatch.delenv("MIN_TEMP", raising=False)
    monkeypatch.setenv("DISCORD_TOKEN", "token")
    monkeypatch.setenv("DEFAULT_CHANNEL", "123")
    monkeypatch.setenv("DEFAULT_CHANNEL_NAME", "general")

    reloaded = reload_settings()

    assert reloaded.AGENT_NAME == "duck"
    assert reloaded.MIN_TEMP == 0.7
    assert reloaded.DEFAULT_CHANNEL == "123"


def test_overrides(monkeypatch):
    """Environment variables override default settings."""
    monkeypatch.setenv("AGENT_NAME", "eagle")
    monkeypatch.setenv("MIN_TEMP", "0.5")
    monkeypatch.setenv("DISCORD_TOKEN", "token")
    monkeypatch.setenv("DEFAULT_CHANNEL", "456")
    monkeypatch.setenv("DEFAULT_CHANNEL_NAME", "chat")

    reloaded = reload_settings()

    assert reloaded.AGENT_NAME == "eagle"
    assert reloaded.MIN_TEMP == 0.5
    assert reloaded.DEFAULT_CHANNEL == "456"


def test_default_channel_required(monkeypatch):
    """DEFAULT_CHANNEL must be provided via the environment."""
    monkeypatch.delenv("DEFAULT_CHANNEL", raising=False)
    monkeypatch.delenv("DEFAULT_CHANNEL_NAME", raising=False)
    monkeypatch.delenv("AGENT_NAME", raising=False)
    monkeypatch.delenv("MIN_TEMP", raising=False)
    monkeypatch.setenv("DISCORD_TOKEN", "token")

    with pytest.raises(KeyError):
        reload_settings()
