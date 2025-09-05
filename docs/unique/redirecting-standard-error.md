---
uuid: 5017e637-7fc7-410a-b253-6a4a9e492294
created_at: redirecting-standard-error.md
filename: Redirecting Standard Error
title: Redirecting Standard Error
description: >-
  The 2>&1 operator redirects standard error (stderr) to standard output
  (stdout) in POSIX shells. This allows combining both streams into a single
  output target. The &> operator is a bash/zsh shorthand for redirecting both
  stdout and stderr to the same location, but it is not POSIX-compliant.
tags:
  - standard error
  - file descriptor
  - POSIX shells
  - bash
  - zsh
  - redirect
  - stdout
  - stderr
---

> 2>&1 is the explicit redirection operator:

> It means “send file descriptor 2 (stderr) to wherever file descriptor 1 (stdout) is currently going.” ^ref-b3555ede-4-0

> Works in all POSIX shells (sh, bash, zsh, dash, etc.). ^ref-b3555ede-6-0
```mermaid
flowchart LR
command --> stdout
command --> stderr
stdout --> file
stderr --> file
```
^ref-b3555ede-7-0
 ^ref-b3555ede-15-0
> &> is a bash/zsh shorthand:
 ^ref-b3555ede-17-0
> It means “redirect both stdout and stderr to the same target.”
 ^ref-b3555ede-19-0
> Not POSIX; won’t work in plain sh or some other shells.
 ^ref-b3555ede-21-0
gg
