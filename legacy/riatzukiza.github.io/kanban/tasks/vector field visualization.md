# Vector field visualizations

We have implemented an abstraction for trails segments that decoupled them
from the ants life cycle. This simplified our field file,
the primary source of our tech debt.
The way I was thinking of doing this was to have ghost entities that only
follow one field, and do not influence , or interact with other entities it by moving.

## Notes

Ghost entities are a good example of an entityt that is not a unit.
It represents a visual effect in the game, but it is not a part of the simulation.

Other examples of non unit entities would be like:
- tile
  - Not selectable, simple, static
- [[shadows.md]]
  - May be a part of a unit, but would be a simple entity.
  - it has a location, and a rendering component,
    but is not meaningful to the simulation.

## Requirements

- the @shared/field.sibilant file is factored out
- [[each.md]] field gets it's own system
- There are non interacting ghost entities that follow the fields
- The number of ghosts is configurable.
- The length of their trails is configurable.

## Blocked by
- [[sparse vector fields]]
