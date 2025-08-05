#!/usr/bin/env python3
"""Populate a new task file with starter content using ollama."""
import subprocess
import shutil
import sys
from pathlib import Path

PROMPT_TEMPLATE = (
    "You are an engineering assistant. Given a task title, "
    "produce a concise markdown task stub with headings for Goals, Requirements, and Subtasks."
)


def generate_content(title: str) -> str:
    """Generate markdown content for the task."""
    if shutil.which("ollama") is None:
        return f"#Todo\n\n## 🛠️ Task: {title}\n\n- outline details here\n"
    prompt = f"{PROMPT_TEMPLATE} Title: {title}"
    try:
        result = subprocess.run(
            ["ollama", "run", "mistral"],
            input=prompt,
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError:
        return f"#Todo\n\n## 🛠️ Task: {title}\n\n- outline details here\n"
    content = result.stdout.strip()
    if not content:
        content = f"## 🛠️ Task: {title}\n\n- outline details here"
    return content + "\n"


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: populate_task_ollama.py <path>")
        return
    path = Path(sys.argv[1])
    if path.exists() and path.stat().st_size > 0:
        return
    title = path.stem.replace("_", " ")
    content = generate_content(title)
    if not content.lstrip().startswith("#"):
        content = "#Todo\n\n" + content
    path.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    main()
