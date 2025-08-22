
With our A* path finding almost complete, we need a more efficient priority queue data structure. We hacked the path finding together with a list, but thats gonna be a huge no go as the map space gets larger. A* does make some good assumptions but no matter what, even the straightest possible paths over a large enough distance will eventually require a large number of open nodes, which will take a long time to sort through
## Related Epics

- [[Data structures]]
- [[Game Mechanics]]
- [[Game AI]]
- [[Path find]]
## Requirements

- There is an implementation of binary heaps
- There is a test for the binary heaps

## Tasks 

- [ ] Implement binary heap using binary tree abstract class
- [ ] Implement a test project for binary heaps like the Red Black Tree project.
- [ ] #Optional Implement a web GL tree visualization system


