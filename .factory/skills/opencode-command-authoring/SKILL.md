---
name: opencode-command-authoring
description: "Create and manage OpenCode commands with valid frontmatter and predictable execution"
---

# Skill: OpenCode Command Authoring

## Goal
Create and manage OpenCode commands with valid frontmatter and predictable execution.

## Use This Skill When
- You need to create a new OpenCode command file.
- You want to list or run existing OpenCode commands.
- The task mentions `create-command` or `opencode-command`.

## Do Not Use This Skill When
- The task is unrelated to OpenCode commands.
- You only need to run generic shell commands.

## Inputs
- Command name and purpose.
- Command frontmatter description.
- Workspace location of `.opencode/command`.

## Steps
1. Use `bin/create-command` or `bin/opencode-command` to create commands.
2. Ensure frontmatter includes a `description` field.
3. Validate the command file exists under `.opencode/command`.
4. Use `opencode-command --list` to verify registration.
5. Run the command with `opencode-command --run <name>`.

## Common Commands

```bash
# Create a command
create-command --name <command>

# List commands
opencode-command --list

# Create a new command file
opencode-command --name <command>

# Run an existing command
opencode-command --run <command>
```

## Output
- A command file in `.opencode/command/<name>.md`.
- Successful command execution or validation output.

## References
- Command tooling: `bin/create-command`
- Command wrapper: `bin/opencode-command`
- Workspace command list: `AGENTS.md`
