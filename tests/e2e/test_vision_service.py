import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread

import time
import urllib.request
import pytest


class _HBHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b"{}")

    def log_message(self, format, *args):  # pragma: no cover - silence logging
        pass


def test_vision_capture_endpoint():
    hb_port = 5064
    hb_server = HTTPServer(("127.0.0.1", hb_port), _HBHandler)
    hb_thread = Thread(target=hb_server.serve_forever, daemon=True)
    hb_thread.start()

    port = 5063
    env = os.environ.copy()
    env.update({"PORT": str(port), "VISION_STUB": "1", "HEARTBEAT_PORT": str(hb_port)})
    proc = subprocess.Popen(["node", "services/js/vision/index.js"], env=env)
    try:
        for _ in range(50):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{port}/capture") as r:
                    headers = r.headers
                    data = r.read()
                    break
            except Exception:
                time.sleep(0.1)
        else:
            pytest.fail("vision service did not start in time")

        assert headers.get("Content-Type") == "image/png"
        assert data == b"stub"
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        hb_server.shutdown()
        hb_thread.join()
