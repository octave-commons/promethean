---
```
uuid: bc415290-a177-4119-8ecb-4daf012c3f7c
```
```
created_at: '2025-09-19T21:39:45Z'
```
title: 2025.09.19.21.39.45
filename: Kanban Process Fundamentals
```
description: >-
```
  This document explains the core principles of a Kanban process as a finite
  state machine with defined transitions and blocking conditions. It emphasizes
  how minor and major blocking conditions trigger interventions without
  requiring a fixed schedule or timer. The process ensures tasks move only when
  necessary, with minimal human intervention.
tags:
  - kanban
  - finite state machine
  - blocking conditions
  - process flow
  - minor blocking
  - major blocking
  - intervention rules
```
related_to_uuid: []
```
```
related_to_title: []
```
references: []
---
I'm saying there isn't a ready to code gate at all. Because the it's all just process.

You're being far too literal about all of this.

I shouldn't have to say anything about the giant inputs.

If I have to dictate all of that, the process is too complex to follow.

The process are the columns on the board.

The phases aren't a part of core process document. That is specific to codex cloud.

The process is a finite state machine.
There is a set of possible states an given task t can be in C
Each state Cn has a set of transitions T a task t can make to other members of C
There is a starting state S
There are transition rules R(Tn, t) that can't ever evaluate to true during the same turn, each transition is a unique rule, and either they are all false, or 1 is true.

When 1 is true, the task t make the T from it's current state, to the transition's target state.

if multiple transitions appear to be valid, if it was just a bunch of humans, it triggers a conversation, an email, a short meeting.
Starting with the smallest possible intervention, gradually escalating until the conflict is resolved.

What makes a kanban powerful is the way the rules naturally create moments of intervention only when actually nessisary
Not on a timer, or a schedule of any kind at all.

If a transition is ambiguous, a minor intervention is required involving 1 or 2 people at most other than the assignee.
It probably only really needs more time to evaluate the state of the task.
It basicly means for our agent, this tick of the process, the task doesn't move, and it needs to keep working on the task according to the rules of the column the task is in.
If it cannot make any further progress from where it is, it ends the session to communicate with the user to resolve it's issue.
etc. This isn't the process I want, I'm trying to elaborate what a kanban process is fundementally.
There are states, a limited number of transitions from any given state to another state, rules that dictate when a transition occurs,
and there are blocking conditions. Work in progress limits. If the board ends up in a situation where a transition should be triggered into a column that has reached it's limit
Everyone stops what they are doing to put the full force of the team behind resolving this issue.

They sit with the board, discuss the state they are in, and decide priorities, etc.

There are Major and minor blocking conditions.
A minor blocking condition requires the a small amount of resources/people/attention to be allocated to it. No one should be stopped from working on their assigned task for more than a few minutes.
A major blocking condition is a stop the world situation. Everything stops until its dealt with.

Minor blocking conditions are like apparent contradictions, the agent doesn't nessisarily have to stop the session to get the user to intervene immediately.
This is a situation where an artifact is added to the card to be dealt with asyncronously.
It proably doesn't stop work from happening. It can be skipped for the moment, as long as it is documented.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
