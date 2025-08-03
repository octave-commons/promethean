#!/usr/bin/env python3
"""Simulate GitHub Actions pull_request workflows locally."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable

import yaml

WORKFLOWS_DIR = Path('.github/workflows')


def _is_pull_request(event: Any) -> bool:
    if event is None:
        return False
    if isinstance(event, str):
        return event == 'pull_request'
    if isinstance(event, dict):
        return 'pull_request' in event
    if isinstance(event, Iterable):
        return 'pull_request' in event
    return False


@dataclass
class Step:
    job: str
    name: str
    run: str
    env: Dict[str, str]
    cwd: Path


def load_workflows(directory: Path = WORKFLOWS_DIR) -> Iterable[tuple[str, Any]]:
    for path in directory.glob('*.yml'):
        with path.open() as fh:
            data = yaml.safe_load(fh) or {}
        yield path.name, data


def _get_on(data: dict) -> Any:
    if 'on' in data:
        return data['on']
    if True in data:
        return data[True]
    return None


def collect_jobs(data: dict) -> Dict[str, list[Step]]:
    jobs: Dict[str, list[Step]] = {}
    if not _is_pull_request(_get_on(data)):
        return jobs
    for job_name, job in (data.get('jobs') or {}).items():
        job_env = job.get('env', {}) or {}
        steps = []
        for idx, step in enumerate(job.get('steps') or []):
            if 'run' not in step:
                continue
            env = {**job_env, **(step.get('env') or {})}
            cwd = Path(step.get('working-directory', '.'))
            name = step.get('name') or f'step-{idx+1}'
            steps.append(Step(job=job_name, name=name, run=step['run'], env=env, cwd=cwd))
        if steps:
            jobs[job_name] = steps
    return jobs


def execute_jobs(jobs: Dict[str, list[Step]], only_job: str | None = None) -> None:
    for job_name, steps in jobs.items():
        if only_job and job_name != only_job:
            continue
        print(f'== Job: {job_name}')
        for step in steps:
            print(f'-- Running {step.name}')
            env = os.environ.copy()
            env.update(step.env)
            try:
                subprocess.run(step.run, shell=True, check=True, cwd=step.cwd, env=env)
            except subprocess.CalledProcessError as exc:
                print(f'Step failed with exit code {exc.returncode}')
                sys.exit(exc.returncode)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description='Simulate GitHub Actions pull_request workflows')
    parser.add_argument('--job', help='Only run a specific job')
    args = parser.parse_args(argv)
    jobs: Dict[str, list[Step]] = {}
    for _, data in load_workflows():
        for name, steps in collect_jobs(data).items():
            jobs.setdefault(name, []).extend(steps)
    if not jobs:
        print('No pull_request jobs found')
        return
    execute_jobs(jobs, only_job=args.job)


if __name__ == '__main__':
    main()
