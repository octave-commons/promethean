import subprocess, os, time, requests


def test_vision_service_e2e(tmp_path):
    env = os.environ.copy()
    env['PORT'] = '5010'
    env['NODE_ENV'] = 'production'
    env['VISION_STUB'] = '1'
    proc = subprocess.Popen(['node', 'services/vision/index.js'], env=env)
    try:
        time.sleep(1)
        resp = requests.get('http://localhost:5010/capture')
        assert resp.status_code == 200
        assert resp.content == b'stub'
    finally:
        proc.terminate()
        proc.wait()

