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

---

## 🎯 Goals

- [ ] Goal 1
- [ ] Goal 2

---

## 📦 Requirements

- [ ] Requirement 1
- [ ] Requirement 2

---

## 📋 Subtasks

- [ ] Step 1
- [ ] Step 2

---

## 🧮 Story Points

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
