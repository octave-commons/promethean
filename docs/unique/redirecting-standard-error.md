---
uuid: b3555ede-324a-4d24-a885-b0721e74babf
created_at: 2025.08.19.08.08.10.md
filename: Redirecting Standard Error
description: >-
  Explains the 2>&1 and &> operators for redirecting stderr to stdout in POSIX
  and shell scripting.
tags:
  - standard error
  - stdout
  - stderr
  - file descriptor
  - POSIX
  - shell scripting
  - redirect
related_to_title:
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references: []
---

> 2>&1 is the explicit redirection operator:

> It means “send file descriptor 2 (stderr) to wherever file descriptor 1 (stdout) is currently going.”

> Works in all POSIX shells (sh, bash, zsh, dash, etc.).
```mermaid
flowchart LR
command --> stdout
command --> stderr
stdout --> file
stderr --> file
```

> &> is a bash/zsh shorthand:

> It means “redirect both stdout and stderr to the same target.”

> Not POSIX; won’t work in plain sh or some other shells.

gg<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
