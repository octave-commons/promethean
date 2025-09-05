---
uuid: 8f1782ee-a75f-4c9e-acb7-3f744ad2c952
created_at: optimizing-command-limitations-in-system-design.md
filename: Optimizing Command Limitations in System Design
title: Optimizing Command Limitations in System Design
description: >-
  Discusses strategies for managing command limits in system design, focusing on
  consolidating actions, limiting endpoints, and potential service splits.
  Highlights the complexity of system design and the need for efficient context
  handling to stay within command constraints.
tags:
  - command limits
  - system design
  - endpoint optimization
---
If my limit is 30 commands I am gonna need to: ^ref-98c8ff62-1-0
A. Consolodate existing actions into others with additional parameters
B. Limit the number of actions 
C. Split the actions up into multiple services


We can do A and B right now through descriptions to the agents. ^ref-98c8ff62-7-0
C will require us to find multiple domains to put different parts of the system behind.
That is not automatable, and it means *even more services*
Complexity is already very high.

I am confident we can get our current endpoints down below 30. We only start splitting up the actions into multiple services/domains when it becomes impossible or unreasonable to consolidate them. ^ref-98c8ff62-12-0

I think we can get better codex context thinking about it if all searches have a ttl on them... ^ref-98c8ff62-14-0
It's gotta be more complicated than that though...
you need a special agent who's job it is to ...

knowledge graph... ^ref-98c8ff62-18-0


markdown parser... ^ref-98c8ff62-21-0

markdown AST ^ref-98c8ff62-23-0


markdown dom... ^ref-98c8ff62-26-0
markdown is designed to compile to html...
html has the dom... the dom allows a system to be mutated and changed...
Document Object Model.
