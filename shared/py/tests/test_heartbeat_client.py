import json
import os
import sys
import threading

from websockets.sync.server import serve

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

from shared.py.heartbeat_client import HeartbeatClient


def test_send_once():
    received = {}

    def handler(ws):
        msg = ws.recv()
        received.update(json.loads(msg))

    with serve(handler, "127.0.0.1", 0) as server:
        port = server.socket.getsockname()[1]
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        client = HeartbeatClient(url=f"ws://127.0.0.1:{port}", pid=1234, name="test")
        client.send_once()
        # give the server a moment to receive the message
        threading.Event().wait(0.1)
        server.shutdown()
        thread.join()

    assert received["action"] == "publish"
    assert received["message"]["payload"] == {"pid": 1234, "name": "test"}
