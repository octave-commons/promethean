---
uuid: "2d9a38db-a0cc-4939-9e30-c38497da6745"
title: "Description"
slug: "script-for-getting-github-action-workflow-states-for-a-branch"
status: "done"
priority: "P3"
labels: ["description", "github", "script", "status"]
created_at: "2025-10-12T02:22:05.428Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































# Description
```
**Status:** blocked
```
Create a script that fetches GitHub Actions workflow runs for a given branch and outputs their status so they can be reviewed or fed to language models.

## Requirements/Definition of done

- Accept repository and branch as arguments.
- Output run IDs, workflow names, and current status in markdown or JSON.
- Handle API pagination and authentication.
- Document usage in `scripts/README.md`.

## Tasks

- [ ] Implement script that calls the GitHub Actions API for a branch.
- [ ] Read GitHub token from environment variables.
- [ ] Format the response into a human-readable table.
- [ ] Add example invocation and output to docs.

## Relevant resources

You might find [GitHub's Actions API](https://docs.github.com/en/rest/actions) useful while working on this task.

## Comments

Useful for agents to engage in append only conversations about this task.

#breakdown

## Blockers
- No active owner or unclear scope








































































































