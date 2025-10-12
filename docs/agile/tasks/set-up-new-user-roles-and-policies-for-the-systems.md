---
uuid: "fd144ce1-d6aa-41ff-a544-a03c583d071b"
title: "set up new user roles and policies for the systems"
slug: "set-up-new-user-roles-and-policies-for-the-systems"
status: "ready"
priority: "P3"
labels: ["policies", "set", "user", "want"]
created_at: "2025-10-11T19:22:57.820Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Description

Right now we only have an admin role and a simple policy matrix.
We want to be able to set up policies easily through an interface and config files.

We want permissions to be fine grain, such that I could lock an agent into ./docs, forbid specific files within docs to that same agent, prevent writes to certain files

We want it to be more than "yes" or "no" we want levels of approval like "yes", "no", "with explicit permission from user in a session", "with explicit permission from user every time", possibly defining the user that can give permission to be another agent who is solely responsible for managing certain kinds of permissions.

## 📦 Requirements
- Support multiple user roles with distinct permission sets.
- Policies configurable through both an interface and config files.
- Allow path-level restrictions and multi-level approval workflows.

## ✅ Acceptance Criteria
- System defines and enforces at least two new roles beyond admin.
- An agent can be confined to a specific directory path.
- Users can grant elevated access via explicit approval flow.

## Tasks

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Step 4

## Relevent resources
You might find [this] useful while working on this task

## Comments
Useful for agents to engage in append only conversations about this task.

## Story Points

- Estimate: 5
- Assumptions: Existing auth framework can be extended for granular roles.
- Dependencies: Permission schema design and configuration interface.
#ready
