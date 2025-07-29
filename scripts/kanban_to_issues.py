import os
import re
import requests

KANBAN_PATH = os.environ.get("KANBAN_PATH", "docs/kanban.md")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_REPO = os.environ.get("GITHUB_REPO")

TASK_PATTERN = re.compile(r"^- \[ \] (.+)")
HASHTAG_PATTERN = re.compile(r"#(\w+)")


def parse_tasks(path=KANBAN_PATH):
    tasks = []
    section = None
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("## "):
                if "To Do" in line or "In Progress" in line:
                    section = line
                else:
                    section = None
                continue
            if section and line.startswith("- [ ]"):
                match = TASK_PATTERN.match(line)
                if match:
                    text = match.group(1)
                    hashtags = HASHTAG_PATTERN.findall(text)
                    title = HASHTAG_PATTERN.sub("", text).strip()
                    tasks.append({"title": title, "labels": hashtags})
    return tasks


def create_issue(task):
    if not GITHUB_TOKEN or not GITHUB_REPO:
        print(f"[DRY-RUN] Would create issue: {task['title']}")
        return None
    url = f"https://api.github.com/repos/{GITHUB_REPO}/issues"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }
    data = {"title": task["title"], "body": "Imported from kanban board.", "labels": task["labels"]}
    resp = requests.post(url, headers=headers, json=data, timeout=10)
    resp.raise_for_status()
    issue = resp.json()
    print(f"Created issue #{issue['number']}: {issue['title']}")
    return issue


def main():
    tasks = parse_tasks()
    for task in tasks:
        create_issue(task)


if __name__ == "__main__":
    main()
