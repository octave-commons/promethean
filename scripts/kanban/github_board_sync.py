"""Synchronize local kanban board with a GitHub Projects board."""

import os
import requests
from requests import HTTPError

KANBAN_PATH = os.environ.get("KANBAN_PATH", "docs/agile/boards/kanban.md")
PROJECT_ID = os.environ.get("GITHUB_PROJECT_ID")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
API_URL = "https://api.github.com"


def read_kanban(path: str) -> list[str]:
    """Return a list of task titles from the To Do column."""
    tasks = []
    current = None
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("## "):
                current = line.strip()
            elif current and "To Do" in current and line.startswith("- [ ]"):
                task = line.split("]", 1)[-1].strip()
                tasks.append(task)
    return tasks


def add_item(title: str) -> None:
    """Add a note card to a project column using the REST API."""
    if not (PROJECT_ID and GITHUB_TOKEN):
        print(f"[DRY-RUN] Would add '{title}' to project {PROJECT_ID}")
        return
    url = f"{API_URL}/projects/columns/{PROJECT_ID}/cards"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.inertia-preview+json",
    }
    try:
        resp = requests.post(url, headers=headers, json={"note": title}, timeout=10)
        resp.raise_for_status()
    except HTTPError as exc:
        print(f"Failed to add '{title}': {exc}")
        return
    print("Created card", resp.json().get("id"))


def main() -> None:
    for task in read_kanban(KANBAN_PATH):
        add_item(task)


if __name__ == "__main__":
    main()
