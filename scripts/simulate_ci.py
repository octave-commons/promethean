#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Simulate GitHub Actions pull_request workflows locally."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable
from itertools import product

import yaml

WORKFLOWS_DIR = Path(".github/workflows")


def _is_pull_request(event: Any) -> bool:
    if event is None:
        return False
    if isinstance(event, str):
        return event == "pull_request"
    if isinstance(event, dict):
        return "pull_request" in event
    if isinstance(event, Iterable):
        return "pull_request" in event
    return False


@dataclass
class Step:
    job: str
    name: str
    run: str
    env: Dict[str, str]
    cwd: Path


def load_workflows(directory: Path = WORKFLOWS_DIR) -> Iterable[tuple[str, Any]]:
    for path in directory.glob("*.yml"):
        with path.open() as fh:
            data = yaml.safe_load(fh) or {}
        yield path.name, data


def _get_on(data: dict) -> Any:
    if "on" in data:
        return data["on"]
    if True in data:
        return data[True]
    return None


def _expand_matrix(matrix: Dict[str, Any] | None) -> Iterable[Dict[str, Any]]:
    """Yield each combination of the matrix strategy."""
    if not matrix:
        yield {}
        return
    include = matrix.get("include") if isinstance(matrix.get("include"), list) else None
    axes = {k: v for k, v in matrix.items() if isinstance(v, list) and k != "include"}
    if not axes:
        if include:
            for item in include:
                if isinstance(item, dict):
                    yield item
        else:
            yield {}
        return
    keys = list(axes)
    for values in product(*(axes[k] for k in keys)):
        base = dict(zip(keys, values))
        if include:
            for item in include:
                if isinstance(item, dict):
                    yield {**base, **item}
        else:
            yield base


def _sub_matrix(text: str, vars: Dict[str, Any]) -> str:
    for key, value in vars.items():
        text = text.replace(f"${{{{ matrix.{key} }}}}", str(value))
    return text


def _evaluate_if(expr: str, vars: Dict[str, Any]) -> bool:
    """Evaluate a simple GitHub Actions ``if`` expression.

    This is intentionally minimal – it only supports referencing matrix
    variables and basic Python expressions.  If evaluation fails, the
    condition defaults to ``True`` so that required steps still run rather
    than silently being skipped.
    """
    expr = _sub_matrix(expr, vars)
    for key, value in vars.items():
        expr = expr.replace(f"matrix.{key}", repr(value))
    try:
        return bool(eval(expr, {}, {}))
    except Exception:
        return True


def collect_jobs(data: dict) -> Dict[str, list[Step]]:
    jobs: Dict[str, list[Step]] = {}
    if not _is_pull_request(_get_on(data)):
        return jobs
    for job_name, job in (data.get("jobs") or {}).items():
        matrix_list = list(_expand_matrix(job.get("strategy", {}).get("matrix")))
        for vars in matrix_list:
            job_env = {**(job.get("env") or {}), **{k: str(v) for k, v in vars.items()}}
            steps = []
            for idx, step in enumerate(job.get("steps") or []):
                if "run" not in step:
                    continue
                if step.get("if") and not _evaluate_if(step["if"], vars):
                    continue
                env = {**job_env, **(step.get("env") or {})}
                cwd = Path(_sub_matrix(step.get("working-directory", "."), vars))
                name = step.get("name") or f"step-{idx + 1}"
                run = _sub_matrix(step["run"], vars)
                step_job_name = job_name
                if vars:
                    matrix_suffix = ",".join(f"{k}={v}" for k, v in vars.items())
                    step_job_name = f"{job_name}[{matrix_suffix}]"
                steps.append(
                    Step(job=step_job_name, name=name, run=run, env=env, cwd=cwd)
                )
            if steps:
                jobs[steps[0].job] = steps
    return jobs


def execute_jobs(jobs: Dict[str, list[Step]], only_job: str | None = None) -> None:
    for job_name, steps in jobs.items():
        if only_job and job_name != only_job:
            continue
        print(f"== Job: {job_name}")
        for step in steps:
            print(f"-- Running {step.name}")
            env = os.environ.copy()
            env.update(step.env)
            try:
                subprocess.run(step.run, shell=True, check=True, cwd=step.cwd, env=env)
            except subprocess.CalledProcessError as exc:
                print(f"Step failed with exit code {exc.returncode}")
                sys.exit(exc.returncode)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description="Simulate GitHub Actions pull_request workflows"
    )
    parser.add_argument("--job", help="Only run a specific job")
    args = parser.parse_args(argv)
    jobs: Dict[str, list[Step]] = {}
    for _, data in load_workflows():
        for name, steps in collect_jobs(data).items():
            jobs.setdefault(name, []).extend(steps)
    if not jobs:
        print("No pull_request jobs found")
        return
    execute_jobs(jobs, only_job=args.job)


if __name__ == "__main__":
    main()
