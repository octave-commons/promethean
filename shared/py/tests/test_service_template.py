import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

# Ensure repository root on sys.path
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

from shared.py.service_template import start_service


class DummyClient:
    def __init__(self):
        self.connect = AsyncMock()
        self.subscribe = AsyncMock()
        self.on_task = MagicMock()
        self.ack = AsyncMock()
        self.fail = AsyncMock()
        self.pull = AsyncMock()


def test_start_service_subscribes_and_dispatches_event():
    client = DummyClient()
    handle_event = AsyncMock()
    with patch("shared.py.service_template.BrokerClient", return_value=client):
        returned = asyncio.run(
            start_service("svc", topics=["topic"], handle_event=handle_event)
        )
    assert returned is client
    client.connect.assert_awaited_once()
    client.subscribe.assert_awaited_once()
    topic, event_handler = client.subscribe.await_args.args
    assert topic == "topic"
    event = {"type": "test"}
    asyncio.run(event_handler(event))
    handle_event.assert_awaited_once_with(event)


def test_start_service_processes_tasks_success_and_failure():
    client = DummyClient()
    handle_task = AsyncMock()
    with patch("shared.py.service_template.BrokerClient", return_value=client):
        asyncio.run(start_service("svc", queues=["q"], handle_task=handle_task))
    client.on_task.assert_called_once()
    task_handler = client.on_task.call_args.args[0]
    task = {"id": "1", "queue": "q"}
    with patch("asyncio.sleep", AsyncMock()):
        asyncio.run(task_handler(task))
    handle_task.assert_awaited_once_with(task)
    client.ack.assert_awaited_once_with("1")
    assert client.fail.await_count == 0
    assert client.pull.await_count == 2  # initial pull + after ack

    # failure path
    handle_task.reset_mock()
    handle_task.side_effect = Exception("boom")
    client.ack.reset_mock()
    client.fail.reset_mock()
    with patch("asyncio.sleep", AsyncMock()):
        asyncio.run(task_handler(task))
    handle_task.assert_awaited_once_with(task)
    client.fail.assert_awaited_once_with("1", "boom")
    assert client.ack.await_count == 0
    assert client.pull.await_count == 3  # another pull after failure
