import re
import sys
from pathlib import Path

REQUIRED_SECTIONS = ["Description", "Goals", "Requirements", "Subtasks"]
STATUS_TAGS = {"#IceBox", "#Accepted", "#Ready", "#Todo", "#InProgress", "#Done"}


def check_file(path: Path):
    text = path.read_text()
    errors = []
    for section in REQUIRED_SECTIONS:
        pattern = re.compile(
            rf"^#+\s*{re.escape(section)}", re.IGNORECASE | re.MULTILINE
        )
        if not pattern.search(text):
            errors.append(f"Missing section: {section}")
    if not any(tag in text for tag in STATUS_TAGS):
        errors.append("Missing status hashtag")
    if errors:
        return path, errors
    return None


def main() -> None:
    directory = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("docs/agile/tasks")
    failures = []
    for md_file in sorted(directory.glob("*.md")):
        result = check_file(md_file)
        if result:
            failures.append(result)
    if failures:
        for path, errs in failures:
            for err in errs:
                print(f"{path}: {err}")
        sys.exit(1)
    print("All task files have required sections and status hashtags.")


if __name__ == "__main__":
    main()
