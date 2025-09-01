---
uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
created_at: 2025.08.13.23.08.32.md
filename: Debugging Broker Connections and Agent Behavior
description: >-
  Today's focus on identifying processes connecting to the broker without
  crashes, empty embeddings, and agent inefficiencies in library usage. The team
  aims to standardize broker access and improve documentation to resolve tracing
  issues.
tags:
  - broker
  - embeddings
  - agent
  - tracing
  - library
  - documentation
  - complexity
related_to_title:
  - Promethean Infrastructure Setup
  - api-gateway-versioning
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - Dynamic Context Model for Web Components
  - observability-infrastructure-setup
  - Pure TypeScript Search Microservice
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references: []
---
It's been a bit of a head scratcher today...

There is a process that seems to be connecting repeatedly to the broker, but it isn't crashing.

The broker logs don't provide enough information for me to identify what process is doing that.

The embeddings seem to be empty often?

I need an easier way to figure out who is doing what. I only get session IDs right now, and they are not helpful.

we fixed the shared typescript packages compiling wierdly. It should be fixed for good now, as long as no one tries to use a relative path to import a typescript file from outside of it's module.

Now, the duck seems to operate, but we aren't following the traces. We don't know why the duck isn't talking.

The ECS module is a lot to grok still, and I am not sure if we are a fan of it's design.

It is complex. And I don't know if it is a useful kind of complexity.

Everything does seem to be in order though... I was kinda going crazy today trying to figure out where the system was actually breaking down.

I think maybe if we worked on standardizing the approach to accessing the broker tomarrow, it might help us track down the issue. There are several diffferent implementations of a client, despite there being a perfectly good shared module.

The agents are not very good at using libraries. They don't get it.
Code reuse is not something they like to do. Not unless it is a module they made on that pass, not with out you being explicit about your desire for them to do so. 

They will have an easier time once I go through and document more of this. I let myself go out too far with the robots with out checking their work. That is on me.

I'll be better about it in the future.

these libraries we have though... that is the thing that did this. We added so much. And there is still more to add.

There is a plan. It's just a long and arduous path.

We were in the zone today. We started out a bit squirrelly lookin at a few fun things.... that was fine. We needed the simple easy, detatched wins. We needed to find our footing. We needed to get somewhere. Medication doesn't magically just fix you. You have to do the work.

I was doing the work today, spinning my wheels until I found a way to go.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
