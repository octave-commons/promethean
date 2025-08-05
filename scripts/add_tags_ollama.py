import subprocess
import shutil
from pathlib import Path

TAG_PROMPT = (
    "Generate five concise tags for the following markdown content. "
    "Respond with space-separated hashtags only."
)


def generate_tags(content: str) -> str:
    """Use ollama to generate tags for the provided content."""
    if shutil.which("ollama") is None:
        return ""
    prompt = f"{TAG_PROMPT}\n\n{content}\n"
    try:
        result = subprocess.run(
            ["ollama", "run", "mistral"],
            input=prompt,
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError:
        return ""
    tags = result.stdout.strip().split()
    return " ".join(tags)


def process_file(path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    tags = generate_tags(content)
    if not tags:
        return
    lines = content.rstrip().splitlines()
    if lines and lines[-1].startswith("#"):
        lines = lines[:-1]
    lines.append(tags)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    for md_file in repo_root.rglob("*.md"):
        process_file(md_file)


if __name__ == "__main__":
    main()
