from pathlib import Path

import scripts.simulate_ci as sc


def test_collect_jobs(tmp_path):
    wf = tmp_path / "workflows"
    wf.mkdir()
    yml = wf / "demo.yml"
    yml.write_text(
        """
on: pull_request
jobs:
  build:
    env:
      GREETING: hello
    steps:
      - run: echo $GREETING
      - name: second
        run: echo world
        working-directory: tests
        env:
          NAME: test
""",
        encoding="utf-8",
    )
    name, data = next(sc.load_workflows(wf))
    jobs = sc.collect_jobs(data)
    assert "build" in jobs
    steps = jobs["build"]
    assert len(steps) == 2
    assert steps[0].env["GREETING"] == "hello"
    assert steps[1].cwd == Path("tests")
