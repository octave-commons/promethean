# Agents Documentation

This idea of agents is both very simple, and very complicated.
On one hand, an agent is just a prompt, and a toolset.
A goal, and the means to achieve that goal.

On the other hand, every platform to host an agent thinks of them slightly differently.
They have different config formats
their environments expose different tools to the agents.
The environment conditions an agent to think of agents differently.
Some platforms have the same agent in different contexts.

so while an agent is a very simple thing, each agent on each platform has to be prompted slightly differently.
While also being able to share some instructions that are not unique
or they are unique to the target, not the agents.

Like instructions for building a codebase
any agent with a cli can run them.

So we have broken down the instructions we give our agents in 3 ways we find meaningful:

- platform
- roles
- residency

## Platform

Platform refers to the program or service that the agent is being run through.

- opencode
- chatgpt
- claude
- codex

## Resident

Residents are "named" agents with a singular identity.
There is meant to only ever be a single instance of any resident.
they are a personality, a face. A presence.

- Duck
- Pythagoras

## Roles

A role is a general set of instructions that may be performed on any platform.
they are a purpose.
