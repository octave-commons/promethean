# Python Script Inventory
#script-inventory

| Script | Function | Imports | Stdlib Only | Heavy Dependencies |
| --- | --- | --- | --- | --- |
| [[scripts/__init__.py]] | Helper package for standalone project scripts. | `-` | Yes | - |
| [[scripts/add_tags_ollama.py]] | Generate and append hashtags to markdown using Ollama | `pathlib, shutil, subprocess` | Yes | - |
| [[scripts/batch_transcribe.py]] | Batch transcription utility. | `__future__, pathlib, shared, sys, typing, wave` | No | - |
| [[scripts/bench_tts_ws.py]] | Benchmark the TTS WebSocket service | `argparse, asyncio, time, websockets` | No | - |
| [[scripts/check_changelog.py]] | Pre-commit hook to validate changelog entries. | `__future__, pathlib, subprocess, sys` | Yes | - |
| [[scripts/check_changelog_fragments.py]] | Validate that all changelog fragments have numeric filenames. | `__future__, pathlib, re, sys` | Yes | - |
| [[scripts/chunk_unique_docs.py]] | Build categorized chunks from unique docs index | `collections, pathlib, re` | Yes | - |
| [[scripts/compile_hy.py]] | Compile Hy source files in ``services/hy`` to Python equivalents in ``services/py``. | `astor, hy, pathlib` | No | - |
| [[scripts/convert_markdown_links_to_wiki.py]] | Convert Markdown links to Obsidian wikilinks | `__future__, argparse, difflib, pathlib, re, sys, typing, urllib` | Yes | - |
| [[scripts/convert_wikilinks.py]] | Convert Obsidian wikilinks to Markdown links | `pathlib, re, sys` | Yes | - |
| [[scripts/download_librispeech-4-gram.py]] | Download pre-trained LibriSpeech 4-gram model | `torchaudio` | No | torchaudio |
| [[scripts/generate_orphan_docs.py]] | Generate documentation for orphaned files using Ollama. | `__future__, pathlib, re, shutil, subprocess` | Yes | - |
| [[scripts/generate_service_templates.py]] | Generate service scaffolding and README templates. | `__future__, argparse, json, pathlib, shutil` | Yes | - |
| [[scripts/hashtags_to_kanban.py]] | CLI entry point to convert hashtags to Kanban board | `kanban` | No | - |
| [[scripts/index_project_files.py]] | Index all project files into a ChromaDB collection. | `__future__, chromadb, os, typing` | No | chromadb |
| [[scripts/kanban_to_issues.py]] | Create GitHub issues from Kanban board tasks | `argparse, os, re, requests` | No | - |
| [[scripts/lint_tasks.py]] | Validate task markdown files for required sections and status tags | `pathlib, re, sys` | Yes | - |
| [[scripts/lowercase_links.py]] | Normalize markdown links and directory names to lowercase | `pathlib, re, sys` | Yes | - |
| [[scripts/ollama_json_test.py]] | Test transcript cleanup using Ollama (requires service) | `asyncio, json, ollama, pytest` | No | - |
| [[scripts/original_demo.py]] | OpenVINO speech demo using Intel models | `argparse, logging, models, numpy, openvino, sys, time, tqdm, utils, wave` | No | numpy, openvino, tqdm |
| [[scripts/populate_task_ollama.py]] | Populate a new task file with starter content using ollama. | `pathlib, shutil, subprocess, sys` | Yes | - |
| [[scripts/rename_changelog_fragments.py]] | Rename changelog fragments to use the actual PR number. | `__future__, os, pathlib, re, sys` | Yes | - |
| [[scripts/simulate_ci.py]] | Simulate GitHub Actions pull_request workflows locally. | `__future__, argparse, dataclasses, itertools, os, pathlib, subprocess, sys, typing, yaml` | No | - |
| [[scripts/stt.py]] | Prototype converting Wav2Vec2 speech model to OpenVINO IR | `openvino, torch, torchaudio, transformers` | No | openvino, torch, torchaudio, transformers |
| [[scripts/stt_module.py]] | Expose STT transcribe function for import | `lib` | No | - |
| [[scripts/stt_request.py]] | Convenience script for invoking the STT service. | `shared` | No | - |
| [[scripts/test_paths.py]] | Example script printing path information | `os, pytest` | No | - |
| [[scripts/tts.py]] | Run TTS pipeline with ForwardTacotron and WaveRNN via OpenVINO | `lib, numpy, openvino, os, shared, soundfile, sys, time` | No | numpy, openvino, soundfile |
| [[scripts/tts_request.py]] | Convenience script for invoking the TTS service. | `shared` | No | - |
| [[scripts/vision_request.py]] | Request image capture from the vision service | `requests` | No | - |
| [[scripts/whisper_test.py]] | Smoke-test OpenVINO Whisper encoder | `numpy, openvino, pytest` | No | numpy, openvino |
