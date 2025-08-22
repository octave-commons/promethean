## Description

To allow insight into agents decision making, and allow better control over agents by the player, agents should have a queue of orders they will follow.

## Requirements

- Agents have an order queue
- The order queue can be changed and reordered 
- Order's can be canceled
- Orders can be added by player interaction

## Tasks

- [ ] Implement order queue
- [ ] Implement a default set of behaviors to add orders dynamicly to the queue
	- [ ] Exploration orders (for when the agent does not have any needs to fulfil)
	- [ ] Hungry queue (Our first need system, behaviors to be added when the agent is hungry.)
	- [ ] Player orders (Orders added manually by a player, overriding orders added automaticly (IE Placed at the front of the queue))
## Blocked by
- [[Implement action system]]