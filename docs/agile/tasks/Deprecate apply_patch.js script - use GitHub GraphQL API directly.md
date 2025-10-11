---
uuid: "d4a57971-d706-4941-ad9f-461c168fce09"
title: "Deprecate apply_patch.js script - use GitHub GraphQL API directly"
slug: "Deprecate apply_patch.js script - use GitHub GraphQL API directly"
status: "incoming"
priority: "P2"
labels: ["github", "script", "api", "use"]
created_at: "2025-10-11T01:03:32.220Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---








The  script duplicates functionality that should be handled directly through GitHub's GraphQL API or existing MCP tools.

## Current Issues:
- Standalone script that wraps GitHub API calls
- Duplicates functionality available in MCP GitHub tools
- Adds maintenance overhead without clear value
- Not integrated with the existing tooling ecosystem

## Migration Path:
1. **Remove script**: Delete 
2. **Update documentation**: Reference MCP GitHub tools instead
3. **Update workflows**: Use  MCP tool directly
4. **Update aliases**: Remove any shell aliases referencing the script

## Replacement Options:
- **MCP Tool**:  via HTTP endpoint 
- **Direct API**: GitHub GraphQL API calls in automation scripts
- **CLI**: Work seamlessly with GitHub from the command line.

USAGE
  gh <command> <subcommand> [flags]

CORE COMMANDS
  auth:          Authenticate gh and git with GitHub
  browse:        Open repositories, issues, pull requests, and more in the browser
  codespace:     Connect to and manage codespaces
  gist:          Manage gists
  issue:         Manage issues
  org:           Manage organizations
  pr:            Manage pull requests
  project:       Work with GitHub Projects.
  release:       Manage releases
  repo:          Manage repositories

GITHUB ACTIONS COMMANDS
  cache:         Manage GitHub Actions caches
  run:           View details about workflow runs
  workflow:      View details about GitHub Actions workflows

EXTENSION COMMANDS
  act:           Extension act

ALIAS COMMANDS
  co:            Alias for "pr checkout"

ADDITIONAL COMMANDS
  agent-task:    Work with agent tasks (preview)
  alias:         Create command shortcuts
  api:           Make an authenticated GitHub API request
  attestation:   Work with artifact attestations
  completion:    Generate shell completion scripts
  config:        Manage configuration for gh
  extension:     Manage gh extensions
  gpg-key:       Manage GPG keys
  label:         Manage labels
  preview:       Execute previews for gh features
  ruleset:       View info about repo rulesets
  search:        Search for repositories, issues, and pull requests
  secret:        Manage GitHub secrets
  ssh-key:       Manage SSH keys
  status:        Print information about relevant issues, pull requests, and notifications across repositories
  variable:      Manage GitHub Actions variables

HELP TOPICS
  accessibility: Learn about GitHub CLI's accessibility experiences
  actions:       Learn about working with GitHub Actions
  environment:   Environment variables that can be used with gh
  exit-codes:    Exit codes used by gh
  formatting:    Formatting options for JSON data exported from gh
  mintty:        Information about using gh with MinTTY
  reference:     A comprehensive reference of all gh commands

FLAGS
  --help      Show help for command
  --version   Show gh version

EXAMPLES
  $ gh issue create
  $ gh repo clone cli/cli
  $ gh pr checkout 321

LEARN MORE
  Use `gh <command> <subcommand> --help` for more information about a command.
  Read the manual at https://cli.github.com/manual
  Learn about exit codes using `gh help exit-codes`
  Learn about accessibility experiences using `gh help accessibility` CLI for manual patch application

## Acceptance Criteria:
- [ ] scripts/apply_patch.js deleted
- [ ] Documentation updated to reference MCP tools
- [ ] No remaining references to apply_patch.js in workflows
- [ ] Tests pass after removal
- [ ] Changelog entry created

## Files to Modify:
- Remove: scripts/apply_patch.js
- Update: Any documentation referencing the script
- Update: CI/CD workflows using the script

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing











