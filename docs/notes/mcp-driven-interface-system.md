---
$$
uuid: a56da54b-7c9c-42d8-bd28-f9049ca612fb
$$
$$
created_at: '2025-09-03T12:41:02Z'
$$
filename: MCP-Driven Interface System
title: MCP-Driven Interface System
$$
description: >-
$$
  A system where pipelines register with a message bus, and an HTTP server
  connects to it to provide an interface. The broker dynamically lists available
  features, enabling procedural UI generation based on metadata. Kafka can
  replace the broker for scalability.
tags:
  - message bus
  - MCP
  - procedural UI
  - kafka
  - pipeline registration
  - interface system
$$
related_to_uuid:
$$
  - 81de642d-cc98-4bf3-aa53-640bbd289ee4
$$
related_to_title:
$$
  - Promethean Forge
references:
  - uuid: 81de642d-cc98-4bf3-aa53-640bbd289ee4
    line: 79
    col: 0
    score: 1
  - uuid: 81de642d-cc98-4bf3-aa53-640bbd289ee4
    line: 59
    col: 0
    score: 0.85
---
I'm thinking about a system where I describe a bunch of pipelines and they all register themselves with a message bus. ^ref-81fb88af-1-0
There is an http server that is connected to the message bus as well.
The http server registers it's self with the broker
the broker provides it with a list of registered features.

I'm basicly describing MCP. But differently... ^ref-81fb88af-6-0
Cause MCP is STDIO first...

so no... I'm not... because the features made available through this system are not just for a model.
They are also for an interface.

So we provide an MCP as an interface to this system, and there is also a UI.

The UI can be procedurally generated based on meta data provided by the broker.

Really... we don't even need the HTTP server do we?


I don't even need to define this broker... I should just use kafka...
 also for an interface.

So we provide an MCP as an interface to this system, and there is also a UI.

The UI can be procedurally generated based on meta data provided by the broker.

Really... we don't even need the HTTP server do we?


I don't even need to define this broker... I should just use kafka...
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Forge](2025.09.03.20.33.00.md)
## Sources
- [Promethean Forge — L79]$2025.09.03.20.33.00.md#^ref-81de642d-79-0$ (line 79, col 0, score 1)
- [Promethean Forge — L59]$2025.09.03.20.33.00.md#^ref-81de642d-59-0$ (line 59, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
