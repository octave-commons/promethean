
## Description

While implementing the needs and mental state systems, several other systems were required for it to function. There had to be items for there to be food to eat, there had to be containers to search for the items in, there had to be a way to find a path to the food when they realized they were hungry, and so on.

Additionally, the logic of the needs and mental state system is cumbersome and difficult to follow. It was hacked together to have a base system for testing other systems. It now needs to be simplified to prepare for more complex features in the future.

Since adding world gen, tile logic has also been duplicated. We have written a whole new class for representing gridlike structures with chunks that implements the same functionality and more that the tile grid system implemented.
## Related Epics

- [[Game Mechanics]]
- [[Optimizations]]
## Requirements

- Containers can contain more than one item
- There is more than one type of item
- Code inside of path finding, needs, and mental state that is more than a few lines should be broken out into methods.
- Factor out duplicate code
- Documentation should be written for these systems.


## Tasks 

- [ ] Refactor metabolisim
- [ ] Refactor Path finding
- [ ] Refactor items
- [ ] refactor mental state
- [ ] refactor containers
- [ ] Refactor main loop tile system

## Blocked by 

## Blocks

## Relavent links
