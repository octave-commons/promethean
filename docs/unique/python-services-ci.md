---
uuid: c50a5705-d76b-447e-a280-7d7d0eea7ce2
created_at: python-services-ci.md
filename: Python Services CI
title: Python Services CI
description: >-
  This CI pipeline runs tests for Python services in a monorepo. It uses a
  matrix strategy to test multiple services (e.g., stt, tts) in parallel. The
  pipeline checks code changes in the services directory and executes pytest
  with specific flags.
tags:
  - ci
  - python
  - monorepo
  - pytest
  - matrix
  - services
---
```yaml
name: Python Services CI

on:
  push:
    paths:
      - 'services/**'
  pull_request:
    paths:
      - 'services/**'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - stt
          - tts
          # Add more service names here
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r services/${{ matrix.service }}/requirements.txt
      - name: Run tests
        run: |
          cd services/${{ matrix.service }}
          python -m pytest --maxfail=1 --disable-warnings -q
```
