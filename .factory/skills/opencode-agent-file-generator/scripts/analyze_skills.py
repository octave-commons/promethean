import json
import os
import re
import glob

SKILLS_DIR = ".opencode/skills"
GRAPH_FILE = ".opencode/skill_graph.json"


def get_skill_name(path):
    return os.path.basename(os.path.dirname(path))


def parse_skill_file(skill_path):
    with open(skill_path, "r") as f:
        content = f.read()

    name = get_skill_name(skill_path)

    # Extract description (from frontmatter or first paragraph)
    description = ""
    # Try frontmatter
    match = re.search(r'^description:\s*["\']?(.*?)["\']?$', content, re.MULTILINE)
    if match:
        description = match.group(1)
    else:
        # Try first paragraph after header
        # Split by empty lines
        paragraphs = content.split("\n\n")
        for p in paragraphs:
            if not p.strip().startswith("#") and not p.strip().startswith("---"):
                description = p.strip().replace("\n", " ")
                break

    # Extract Category (heuristic from path or known map? or generic?)
    # We can default to "General" or try to map.
    # For now, let's look for "## CATEGORY" if I added it? No I didn't add it to SKILL.md, only AGENTS.md.
    # Let's map based on name prefix?
    category = "General"
    if name.startswith("validate-"):
        category = "Kanban"
    if name.startswith("work-on-"):
        category = "Kanban"
    if name.startswith("kanban-"):
        category = "Kanban"
    if name.startswith("testing-"):
        category = "Testing"
    if name.startswith("workspace-"):
        category = "Workspace"
    if name.startswith("pm2-") or "pm2" in name:
        category = "PM2"
    if "clojure" in name:
        category = "Clojure"
    if "opencode" in name:
        category = "OpenCode"
    if "git" in name:
        category = "Git"

    # Extract Next Skills
    next_skills = []
    # Pattern: - **[skill-name](../skill-name/SKILL.md)**
    matches = re.findall(r"-\s*\*\*\[(.*?)\]\(\.\./(.*?)/SKILL\.md\)\*\*", content)
    for match in matches:
        # match[0] is name, match[1] is dir name (usually same)
        next_skills.append(match[1])

    # Entry Point Heuristic
    # If it starts with "work-on", "testing-", "workspace-", or is explicitly marked
    is_entry_point = False
    if name.startswith("work-on-"):
        is_entry_point = True
    if name.startswith("testing-") and "general" in name:
        is_entry_point = True
    if name == "workspace-lint" or name == "workspace-typecheck":
        is_entry_point = True
    if "pm2-process-management" in name:
        is_entry_point = True
    if "opencode-agents-skills" in name:
        is_entry_point = True

    return {
        "name": name,
        "category": category,
        "description": description,
        "next_skills": sorted(list(set(next_skills))),
        "is_entry_point": is_entry_point,
    }


def main():
    graph = {}

    skill_files = glob.glob(os.path.join(SKILLS_DIR, "*/SKILL.md"))
    print(f"Analyzing {len(skill_files)} skills...")

    for skill_file in skill_files:
        try:
            data = parse_skill_file(skill_file)
            graph[data["name"]] = {
                "category": data["category"],
                "description": data["description"],
                "next_skills": data["next_skills"],
                "is_entry_point": data["is_entry_point"],
            }
        except Exception as e:
            print(f"Error parsing {skill_file}: {e}")

    with open(GRAPH_FILE, "w") as f:
        json.dump(graph, f, indent=2)

    print(f"Skill graph saved to {GRAPH_FILE}")


if __name__ == "__main__":
    main()
