
# unit system

We need an abstraction that allows us to describe and talk about agents abstractly with out manually creating them every time. We have "Entity Groups" right now, but that requires us to create a new entity group every time we have a new set of entities, and the way it is written there cannot be overlap between the groups.

If we wanted to say create [[multiple factions.md]] that [[each.md]] have the same set of units, just using entity groups as they are would be combersome.

## Requirements

- An abstraction is implemented for describing, creating, and managing complex multi 
  entity systems that compose a larger unit
- Units are easily clearable
- Units are selectable
- Units are all movable


## Tasks
- Ants, rocks, and plants are easily managable through a unit interface