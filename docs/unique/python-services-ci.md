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
related_to_uuid:
  - c54611b2-b773-43b5-ae69-ed711f1652c1
related_to_title:
  - promethean-notes
references:
  - uuid: c54611b2-b773-43b5-ae69-ed711f1652c1
    line: 2
    col: 0
    score: 1
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
bde7b416a8
    line: 68
    col: 0
    score: 0.91
  - uuid: 4d8cbf01-e44a-452f-96a0-17bde7b416a8
    line: 400
    col: 0
    score: 0.91
  - uuid: 4d8cbf01-e44a-452f-96a0-17bde7b416a8
    line: 107
    col: 0
    score: 0.89
  - uuid: 4d8cbf01-e44a-452f-96a0-17bde7b416a8
    line: 130
    col: 0
    score: 0.87
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
