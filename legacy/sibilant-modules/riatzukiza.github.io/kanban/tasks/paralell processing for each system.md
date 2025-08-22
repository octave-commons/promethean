## Description

This task may be a bit harder than the others.

In theory [[each.md]] system should be able to work totally independently if given the previous state of the system.

Right now though, only the current state is stored and everything is updated in place.

I did somthing like this in symbiants.
Symbiants was a cellular automata, so it was easier to detect collision. If somthing was to end up in the same spot as somthing else, you would know because its a lookup.

In a cartiesian space where objects have varying size and coordinates are floats, you need to check everything. At least you need to check everything nearby, using a quad or an octtree.

The idea for pseudo immutability will be the same though. Keep two versions of the datastructure used to store the systems state, freeze the one holding the previous state, and update the other for the current state. When everything is upated, the two objects switch places and the one is locked and the other is updated on the state of the prior.

## Related Epics

- [[Game Mechanics]]


#epic #multi-threading #optimizations