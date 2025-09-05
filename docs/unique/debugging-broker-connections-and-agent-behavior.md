---
uuid: a463e42f-aba3-40c3-80fe-7a0ced9c4a5c
created_at: debugging-broker-connections-and-agent-behavior.md
filename: debugging-broker-connections
title: debugging-broker-connections
description: >-
  Identifying processes connecting to the broker without crashes, empty
  embeddings, and challenges in tracing agent behavior through session IDs. The
  issue involves complex ECS module design and inconsistent client
  implementations that hinder debugging efforts.
tags:
  - broker connections
  - agent behavior
  - session ids
  - ecs module
  - client implementations
  - debugging challenges
  - empty embeddings
  - process tracing
---
It's been a bit of a head scratcher today... ^ref-73d3dbf6-1-0

There is a process that seems to be connecting repeatedly to the broker, but it isn't crashing. ^ref-73d3dbf6-3-0

The broker logs don't provide enough information for me to identify what process is doing that. ^ref-73d3dbf6-5-0

The embeddings seem to be empty often? ^ref-73d3dbf6-7-0

I need an easier way to figure out who is doing what. I only get session IDs right now, and they are not helpful. ^ref-73d3dbf6-9-0

we fixed the shared typescript packages compiling wierdly. It should be fixed for good now, as long as no one tries to use a relative path to import a typescript file from outside of it's module. ^ref-73d3dbf6-11-0

Now, the duck seems to operate, but we aren't following the traces. We don't know why the duck isn't talking. ^ref-73d3dbf6-13-0

The ECS module is a lot to grok still, and I am not sure if we are a fan of it's design.

It is complex. And I don't know if it is a useful kind of complexity. ^ref-73d3dbf6-17-0

Everything does seem to be in order though... I was kinda going crazy today trying to figure out where the system was actually breaking down. ^ref-73d3dbf6-19-0

I think maybe if we worked on standardizing the approach to accessing the broker tomarrow, it might help us track down the issue. There are several diffferent implementations of a client, despite there being a perfectly good shared module.

The agents are not very good at using libraries. They don't get it. ^ref-73d3dbf6-23-0
Code reuse is not something they like to do. Not unless it is a module they made on that pass, not with out you being explicit about your desire for them to do so. 

They will have an easier time once I go through and document more of this. I let myself go out too far with the robots with out checking their work. That is on me. ^ref-73d3dbf6-26-0

I'll be better about it in the future. ^ref-73d3dbf6-28-0

these libraries we have though... that is the thing that did this. We added so much. And there is still more to add. ^ref-73d3dbf6-30-0

There is a plan. It's just a long and arduous path. ^ref-73d3dbf6-32-0

We were in the zone today. We started out a bit squirrelly lookin at a few fun things.... that was fine. We needed the simple easy, detatched wins. We needed to find our footing. We needed to get somewhere. Medication doesn't magically just fix you. You have to do the work. ^ref-73d3dbf6-34-0

I was doing the work today, spinning my wheels until I found a way to go.
