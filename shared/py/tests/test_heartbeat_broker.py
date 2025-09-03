# SPDX-License-Identifier: GPL-3.0-only
import asyncio
import os
import types

import pytest


class DummyBrokerClient:
    def __init__(self, client_id=None):
        self.client_id = client_id
        self.publishes = []
        self.connected = False

    async def connect(self):
        self.connected = True

    async def publish(self, type_, payload, **opts):
        # mirror BrokerClient.publish signature in shared/py/broker_client.py
        self.publishes.append((type_, payload, opts))


@pytest.mark.asyncio
async def test_start_broker_heartbeat_publishes_then_can_cancel(monkeypatch):
    # Arrange: patch the helper to use our dummy client
    import shared.py.heartbeat_broker as hb

    monkeypatch.setenv("HEARTBEAT_INTERVAL", "0.01")

    dummy_mod = types.SimpleNamespace(BrokerClient=DummyBrokerClient)
    monkeypatch.setattr(hb, "BrokerClient", DummyBrokerClient)

    # Act: start and let it tick
    client, task = await hb.start_broker_heartbeat("test-service")

    # Wait enough time for at least one publish
    await asyncio.sleep(0.03)

    # Cancel the loop task to avoid leaking background work
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    # Assert
    assert client.connected is True
    assert any(t == "heartbeat" for (t, _p, _o) in client.publishes)
    # payload should include pid and name
    hb_payloads = [p for (t, p, _o) in client.publishes if t == "heartbeat"]
    assert hb_payloads, "expected at least one heartbeat publish"
    for payload in hb_payloads:
        assert "pid" in payload and "name" in payload
