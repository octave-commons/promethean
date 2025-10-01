<%*
const statusOptions = [
  "incoming",
  "accepted",
  "breakdown",
  "ready",
  "todo",
  "in-progress",
  "in-review",
  "document",
  "done",
  "blocked"
];
const priorityOptions = ["P0", "P1", "P2", "P3", "P4"];
const defaultStatus = "todo";
const defaultPriority = "P3";
const select = async (options, message, fallback) => {
  if (tp.system?.suggester) {
    const choice = await tp.system.suggester(options, options, false, message);
    if (choice) {
      return choice;
    }
  }
  return fallback;
};
const prompt = async (message) => {
  if (tp.system?.prompt) {
    return await tp.system.prompt(message, "");
  }
  return "";
};
const status = await select(statusOptions, "Select task status", defaultStatus);
const priority = await select(priorityOptions, "Select task priority", defaultPriority);
const labelsInput = await prompt("Comma-separated labels (optional)");
const labels = labelsInput
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const toHashtag = (value) =>
  "#" +
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
const statusHashtag = toHashtag(status);
%>
---
uuid: <% tp.user.uuidv4() %>
title: <% tp.file.title() %>
status: <% status %>
priority: <% priority %>
labels:<%* if (labels.length === 0) { tR += " []"; } else { tR += "\n" + labels.map((label) => `  - ${label}`).join("\n"); } %>
created_at: '<% tp.date.now("YYYY-MM-DDTHH:mm:ss.SSS[Z]") %>'
---
<% statusHashtag %>

## 🛠️ Description

- Outline the task background, intent, and desired outcome.

## Description
- **What changed?** [Describe the key changes that have occurred, e.g., updated requirements, new feature added]
- **Where is the impact?** [Specify the location or scope where these changes are relevant, e.g., specific project, department]
- **Why now?** [Explain why these changes are necessary at this time, e.g., due to deadline, feedback from stakeholders]
- **Supporting context** ([link or path] to relevant documentation, data, or assets)

## Goals
- [Outline the measurable outcomes or success criteria for this task]
- [List any dependencies, stakeholders, or milestones that must be coordinated]

## Requirements
- [ ] test X passes: [Briefly describe the testing scenario]
- [ ] doc Y updated: [Mention the specific documentation or resource that has been updated]
- [ ] PR merged: ([link to the PR] with a brief summary of changes)
- [ ] Additional constraints or non-functional requirements are addressed: [List or link to relevant specifications]

## Subtasks
1. … [Outline the high-level steps for completing this task, including any dependencies or resources required]
2. …
3. …

Add the estimate here (Fibonacci: 1, 2, 3, 5, 8, 13).

---

## 🔗 Related Epics

- [[kanban]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- None

---

## 🔍 Relevant Links

- Link to supporting docs or references.
