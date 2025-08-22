# Epic
One of the core mechanics in an rts game is the ability to issue movement commands. The way we do that in this game will be a little different than how it is usually [[done.md]].
I'm thinking that you can select a group of units, and you issue a series of way points, then a ghost ant quickly traverses the field until it reaches that point, up to a limit.
If the point can be reached with the existing field with in the traversal limit, that path is is used ontop of the noise to reach it.

Agents in other games use A* or similar such algorithims to find the fastest path given a set of known obstacles. I want for these agents to be able to find a path regardless of any changes to the structure of the graph that may occur from the moment the issue is ordered to the moment they arrive. 

If the path cannot be reached with in the traversal limit, then a random walk initiates. The agents will scatter to the noise with a dispersal proportionate to a dragged out circle at the point the movement order was given and the number of agents that were selected. If this occurs the user will be notified that the agents may not take the fastest path to their destination as the fastest path is not known. The user will also be notified if somthing changes along the route and the agents have to take a different path or action is needed from the user for the agents to continue.

The idea being that the user is expected to give fewer, high level commands to the agents, as the agents will be performing many duties automaticly. It'd be like if an AI was playing a regular strategy game, and the user was coordinating it.

We want a game that is as fast paced as starcraft, but as expansdive as civilizations, with less hand cramps, and a much larger scale. Unit counts are limited in star craft due to a limit of users cognative capacity to deal with that many units.

Man this is going to be a lot of work.
## Related Epics
- [[Game Mechanics.md]]
- [[Game AI.md]]
## Requirements

- User can issue general move commands.
- user is notified if there are expected to be complications on the route
- User can set multiple waypoints
- A set of path vectors are generated for [[each.md]] waypoint
- Agents are still influenced by changing in the underlying field that generated the waypoint
- User is informed if the path has been updated
- User is informed if the path has become blocked based on complicating factors unknown at the time of path generation


## Tasks 

- [ ] Implement ghost agent traversal
- [ ] implement notification system
- [ ] Implement obstacle detection system
- [ ] Implement course correction/refinement system
- [ ] Implement way point system

## Blocked by 

- [[Movement waypoints]]
- [[unit system.md]]
- [[Round trip path finding.md]]
- [[Order queues.md]]
- [[ground tiles.md]]
- [[elevation.md]]

#epic #GameAI