import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

from shared.py.heartbeat_client import HeartbeatClient


class _Handler(BaseHTTPRequestHandler):
    last_body = None

    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        _Handler.last_body = json.loads(body.decode("utf-8"))
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(
            json.dumps({"status": "ok", "pid": _Handler.last_body["pid"]}).encode(
                "utf-8"
            )
        )

    def log_message(self, *args, **kwargs):
        return


def test_send_once():
    server = HTTPServer(("127.0.0.1", 0), _Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    url = f"http://127.0.0.1:{server.server_port}/heartbeat"
    client = HeartbeatClient(url=url, pid=1234)
    resp = client.send_once()

    server.shutdown()
    thread.join()

    assert resp == {"status": "ok", "pid": 1234}
    assert _Handler.last_body == {"pid": 1234}
