---
uuid: "6e58071f-eeec-4a12-8d36-e5e3a8d29a24"
title: "Dev mode"
slug: "dev mode for each package"
status: "icebox"
priority: "P3"
labels: ["dev", "mode", "should", "package"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


# Dev mode

Every package should have a dev mode that watches the files and builds the package when something changes. The tests should be reran after the the project builds. Lint should be ran, etc. Just the whole everything. Everything gets done as soon as it restarts.

If there is a webserver, frontend, etc, the frontend should restart, the app should restart, after the project is built.
If it builds successfully. Do not restart the package instance if it does not build successfuly

Not all packages are applications, many are libraries, modules, utilities, some are just CLI commands.




