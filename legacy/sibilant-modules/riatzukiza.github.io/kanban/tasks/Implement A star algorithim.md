
We need a way to find paths that doesn't entirely depend on units randomly wandering around until they find the goal.

The Symbiants project was implemented to demonstrate how powerful *just* following the weights could be.'

They had no idea where they were going and they still got there.

With A*, they can know where they are going and with ACO, they can know what is along the way. 

A* finds the best path given known weights.

ACO doesn't find paths, as much as it describes possible routes and ranks them on feasability and efficiency given high traffic conditions.

The fastest route is no longer the fastest when everyone is taking it.

## Related Epics
- [[Game Mechanics]]
- [[Algorithims]]
- [[Data structures]]
- [[Game AI]]
- [[Intelligent movement commands]]
## Requirements

- There is a game system using the A* algorithim for path finding
- The algorithim can use vector fields as a part of it's heuristics

## Tasks 

- [x] Implement baseline path finding ✅ 2025-01-12
- [ ] refine path finding for efficiency, ease of use, and interaction with other systems
- [ ] Add heuristic system
