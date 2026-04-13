import json
import os
import glob
import re

# Configuration
GRAPH_FILE = ".opencode/skill_graph.json"
SKILLS_DIR = ".opencode/skills"
ROOT_AGENTS_FILE = "AGENTS.md"


def load_graph():
    """Load the skill dependency graph."""
    if not os.path.exists(GRAPH_FILE):
        print(f"Error: {GRAPH_FILE} not found. Please generate the skill graph first.")
        return {}
    with open(GRAPH_FILE, "r") as f:
        return json.load(f)


def extract_triggers(skill_name):
    """Extract trigger words from a skill's SKILL.md file."""
    skill_path = os.path.join(SKILLS_DIR, skill_name, "SKILL.md")
    if not os.path.exists(skill_path):
        return []

    with open(skill_path, "r") as f:
        content = f.read()

    # Pattern 1: trigger: ["word1", "word2"] in frontmatter
    match = re.search(r"^trigger:\s*\[(.*?)\]", content, re.MULTILINE)
    if match:
        raw = match.group(1)
        return [w.strip().strip("\"'") for w in raw.split(",")]

    # Pattern 2: Single trigger line
    match = re.search(r"^trigger:\s*(.*)", content, re.MULTILINE)
    if match and "[" not in match.group(1):
        return [match.group(1).strip()]

    return []


def get_entry_points(graph):
    """Filter skills that are marked as entry points."""
    return {k: v for k, v in graph.items() if v.get("is_entry_point")}


def determine_relevant_skills(path, entry_points):
    """Heuristically determine which skills apply to a given directory path."""
    relevant = set()

    # File existence checks
    has_clj = bool(
        glob.glob(os.path.join(path, "*.clj*"))
        or glob.glob(os.path.join(path, "deps.edn"))
    )
    has_ts = bool(
        glob.glob(os.path.join(path, "*.ts"))
        or glob.glob(os.path.join(path, "tsconfig.json"))
    )
    has_pm2 = bool(glob.glob(os.path.join(path, "ecosystem.config.*")))
    has_tests = bool(glob.glob(os.path.join(path, "*test*")))
    is_git_root = os.path.exists(os.path.join(path, ".git")) or os.path.exists(
        os.path.join(path, ".gitmodules")
    )

    # Always include generic Kanban skills
    relevant.add("work-on-todo-task")
    relevant.add("work-on-in_progress-task")

    for skill, data in entry_points.items():
        cat = data.get("category", "")

        # Category-based matching
        if cat == "Clojure" and has_clj:
            relevant.add(skill)
        if cat == "PM2" and has_pm2:
            relevant.add(skill)
        if cat == "Git" and is_git_root:
            relevant.add(skill)
        if cat == "Testing":
            if has_tests:
                relevant.add(skill)
            elif (has_clj or has_ts) and skill == "testing-general":
                relevant.add(skill)

        # Specific skill matching
        if skill == "workspace-lint" and (has_ts or has_clj):
            relevant.add(skill)
        if skill == "workspace-typecheck" and has_ts:
            relevant.add(skill)
        if skill == "testing-typescript-vitest" and os.path.exists(
            os.path.join(path, "vitest.config.ts")
        ):
            relevant.add(skill)

    return sorted(list(relevant))


def find_subpackages():
    """Recursively find all sub-packages in the workspace."""
    roots = set()

    # Standard recursive walk excluding ignored dirs
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".git" in root or ".opencode" in root:
            continue
        markers = ["package.json", "deps.edn", "project.clj", ".gitmodules"]
        if any(f in files for f in markers):
            roots.add(root)

    # Explicit check for orgs structure
    for org in glob.glob("orgs/*"):
        if os.path.isdir(org):
            for repo in glob.glob(os.path.join(org, "*")):
                if os.path.isdir(repo):
                    roots.add(repo)
    return sorted(list(roots))


def regenerate_root_agents(graph):
    """Regenerate the workspace root AGENTS.md file."""
    if not os.path.exists(ROOT_AGENTS_FILE):
        return

    with open(ROOT_AGENTS_FILE, "r") as f:
        lines = f.readlines()

    # Find insertion point to preserve header/intro
    cut_index = -1
    for i, line in enumerate(lines):
        if line.strip().startswith(
            "## Skills and Trigger Words"
        ) or line.strip().startswith("## SKILLS"):
            cut_index = i
            break
    if cut_index == -1:
        cut_index = len(lines)

    header_content = "".join(lines[:cut_index])
    new_content = header_content
    new_content += "## SKILLS\n\n"
    new_content += "The following skills are available in this workspace. They are organized by category.\n\n"

    # Group entry points by category
    entry_points = {k: v for k, v in graph.items() if v.get("is_entry_point")}
    by_category = {}
    for skill, data in entry_points.items():
        cat = data.get("category", "General")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(skill)

    for cat in sorted(by_category.keys()):
        new_content += f"### {cat}\n\n"
        for skill in sorted(by_category[cat]):
            data = graph[skill]
            new_content += f"#### {skill}\n"
            new_content += f"{data['description']}\n"

            triggers = extract_triggers(skill)
            if triggers:
                new_content += f"- **Trigger Words**: {', '.join(triggers)}\n"
            new_content += "\n"

    with open(ROOT_AGENTS_FILE, "w") as f:
        f.write(new_content)
    print(f"Regenerated {ROOT_AGENTS_FILE}")


def regenerate_subpackage_agents(graph):
    """Regenerate AGENTS.md for every detected sub-package."""
    entry_points = get_entry_points(graph)
    packages = find_subpackages()

    for pkg in packages:
        skills = determine_relevant_skills(pkg, entry_points)
        if not skills:
            continue

        agent_path = os.path.join(pkg, "AGENTS.md")

        header = "# Agent Skills Context\n\n"
        content = "## RELEVANT SKILLS\n"
        content += "These skills are configured for this directory's technology stack and workflow.\n\n"

        for skill in skills:
            data = graph[skill]
            desc = data["description"]
            content += f"### {skill}\n"
            content += f"{desc}\n"

            triggers = extract_triggers(skill)
            if triggers:
                content += f"- **Trigger Words**: {', '.join(triggers)}\n"
            content += "\n"

        # Update or Create
        if os.path.exists(agent_path):
            with open(agent_path, "r") as f:
                existing = f.read()

            if "## RELEVANT SKILLS" in existing:
                parts = existing.split("## RELEVANT SKILLS")
                preamble = parts[0]
                with open(agent_path, "w") as f:
                    f.write(preamble + content)
                print(f"Updated {agent_path}")
            else:
                with open(agent_path, "a") as f:
                    f.write("\n" + content)
                print(f"Appended to {agent_path}")
        else:
            with open(agent_path, "w") as f:
                f.write(header + content)
            print(f"Created {agent_path}")


def main():
    graph = load_graph()
    if graph:
        regenerate_root_agents(graph)
        regenerate_subpackage_agents(graph)


if __name__ == "__main__":
    main()
