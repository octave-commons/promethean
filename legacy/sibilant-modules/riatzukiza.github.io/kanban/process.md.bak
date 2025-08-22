# Board flow

```

New-> Accepted -> Breakdown -----> Ready -> Todo -> In Progress -> In Review -> Done
|                 |  |  ^          ^                |    ^            |
|                 |  |  |          |                |    |            |
----> Rejected<----  -> Blocked ---|    |<-----------    |-------------
                           ^            |<----------------
                           |-------------
```

```
New -> Accepted -> Breakdown -----> Ready -> Todo -> In Progress -> In Review -> Done
|                 |  |  ^    \       ^                |    ^            |
|                 |  |  |     \      |                |    |            |
----> Rejected<----  -> Blocked  \----|    |<-----------    |-------------
                     \     ^      \        |<----------------
                      \   /        \-------------------------
                     Ice Box

```

# New

Feature ideas we may or may not do. A place for brainstorming.


## Acceptance Criteria

New ideas can move to either an accepted or rejected state.

```
New-> Accepted
|
----> Rejected
```
- We've started writing about it
- it seems feasable.
- It is not a duplicate.

# Rejected

Tasks we opened up that we later realized were not useful, or a duplicate of an existing task.

Rejected tasks do not have state transitions at the moment.

```
New  Breakdown
|    |
--------> Rejected
```
## Tasks

- a backend implementation of the simulation
  - Duplicate
- Components as data views
  - Redundent by entity panel, provides data view


# Accepted

Features we have decided to look into.
If we think they will add value we will move on to break down.
The task must be described to continue

Accepted tasks cannot be rejected with out first going through [breakdown](breakdown.md)


```
Accepted -> Breakdown
```

## Acceptance Criteria

- A brief description of the task is created. 
- We have decided the feature has value
- The task must not be a duplicate or redundent.

# Breakdown (5)

Features we are actively thinking about and preparing for work.
The result of a [breakdown](breakdown.md) is either a task that is [ready](ready.md) for work,
or a task that is rejected upon further examination.
Tasks may become [blocked](blocked.md) if once the work was started it became [clear](../docs/Pools/Dynamic/clear.md)
the task was not defined clearly enough.

```

Breakdown->Ready
|
->Blocked

```

## Definition of done

- requirements
- explaination of value
- a general approach to the problem


# Blocked

Features that have been refined and are [ready](ready.md) to work on after a feature they rely on has been implemented


# Ready

Tasks that are [ready](ready.md) to be worked that we have not decided to start.
Tasks that are [ready](ready.md) for work have not been prioritized and there is no estimate on complexity.


# Todo (2)

Tasks that have been prioritized and estimated. These are what are to be [done](done.md) after 
in progress tasks have been completed.


# In Progress (2)

Tasks that are currently being worked on.

# In Review (2)

Work that has been completed but needs to be reviewed to be sure.


# Done

The work has been reviewed and we are sure that it is [done](done.md).
:confetti:
