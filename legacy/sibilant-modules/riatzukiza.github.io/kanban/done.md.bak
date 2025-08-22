
# Github static website

This has to be a priority. 
People need to be able to see my work.
This requires me to have a landing page.
I need to research what is required to set up a github static website.

Turns out it's pretty easy. I renamed the repository, set up a github 
action for a static html website.

Now I need an actual website.

I think we can call this done though, we have the work flow for a static github website and it is deployed. All we have to do is keep working on everything.

Future work will be added specific to the website around the portfolio projects as needed.


# Entity Inspector

# Description

In addition to a side pallette to place the entities with, I want an interface to inspect and edit existing entities and their properties.

# Work so far

I have a panel that displays all of the rocks and their properties. 

# Work remaining

- a similar panel for all entities.
- pagination
- collapsable

# Progress update 12-7-2024

I started working on a component system encapsulating interfaces for entities.

# Progress 12-7-2024

I have pagination, and the system is set up to work for any entity with "view"able components.
I have not made it collapsable.


# Simulation Reset

This feature will help me make sure that I am clearing the object pools correctly and let me change settings easier with out having to restart if I want to see the simulation from the start with a new set of settings.

## Requirements

- A button that resets the simulation without
  refreshing the page
- The simulation is not degraded in performance
  from memory leaks or other artifacts leftover
  from the previous simulation instance.

## Update 12-9-24

It seems to be working as it is now, we'll keep an eye on it as other work is introduced to make sure 
the button continues to work. it is possible that more complex features later on will end up requring more work, as it is possible that there are still despawning paths that have not been taken (Clearing all the entity groups is fine for what the game is now)

## Update 12 12 24

I have added signal trail entities, I have to add them to the reset button and test.
The signal trails already have to [despawn](../docs/Pools/Dynamic/despawn.md) a lot so I am figuring this will go smoothly.
I should keep the entity groups in a list so I can write a function to [despawn](../docs/Pools/Dynamic/despawn.md) all of them every time I add a new one
so I don't always have to remember to add them to the reset button.

# Trail Entities

The signal field code has the most tech debt of all the systems.
I want to be able to visualize the  trails agents leave behind.
The agents should be able to live longer than their trail.
When a trail has reached its max size, the oldest trail segment
should [despawn](../docs/Pools/Dynamic/despawn.md) and contribute nothing to the win/loose field update.

## Requirements

- Trails can be seen
- Agents life is not dependent on the length of the trail
- Agents do not loose when the trail max length is met
- the oldest trail segment despawns when a trail reaches its max length.


## Started 12 10 24

We are going to start by breaking down the huge ass field function.
It is probably multiple systems.
It is currently where the trails are tracked, and they are outside of the ECS.
Agents will get a new component: Trail
The trail system will create a new entity for [each](../docs/Pools/Dynamic/each.md) tick of movement at the location of the agent.
The Trail segment will have: 
- position component
- dot component
- signal vector component
- experation component

The position and dot systems are already in place.
The signal vector component stores the velocity of the agent at the time of creation.
The experation component stores the time the agent created the signal.
The signal expires if the current tick is placement time + max-trai-length.
When expired the trail segment entity despawns.
If the agent succeeds, all non expired signal vectors are applied to the signal field.
If the agent fails, all non expired signal vectors are applied inversely to the signal field.
All trail segments associated with an agent that has succeeded or failed [despawn](../docs/Pools/Dynamic/despawn.md) 
after they are applied.

## Update 12-11-24

The modules are started, but they are all over the place.
This has to be done, the field file is a mess that limits how far I can take this,
as it exists largely outside of the entity component framework.


### New component system interfaces

The new interfaces have been created, most of them at least. There may be more, but we are starting here.

- [Timer](../docs/Obstacles/systems/Timer.md)
- [Ant-dot](../docs/Obstacles/systems/Ant-dot.md)
- Ant-life-[Timer](../docs/Obstacles/systems/Timer.md)
- Ant-trails
- Trail Dots
- Trail segments

#### Timer

The [Timer](../docs/Obstacles/systems/Timer.md) type is initialize with a duration and a callback.
When the duration has been reached, the callback is called and the [Timer](../docs/Obstacles/systems/Timer.md) is flagged as deactivated.
The call back can reset or [despawn](../docs/Pools/Dynamic/despawn.md) the [Timer](../docs/Obstacles/systems/Timer.md).

The ant life and trail life components are durived from this.

#### Ant life
The ant life [Timer](../docs/Obstacles/systems/Timer.md) sets the entity back to [spawn](../docs/Pools/Dynamic/spawn.md), increases the loose count, and resets the [Timer](../docs/Obstacles/systems/Timer.md).

#### Trail segment
The trail life component encapsulates a vector, and its call back despawns the vector.

#### Ant dots

A simple sub class of the dot interface with a fixed color.
Using more than one instance of the dot interface will give us more layers of vertices, and a higher limit on the number of entities we can have.

#### Trail dot

Similar to the ant dot, it is also an instance of the dot interface with a fixed color.
It's alpha will vary with the remaining duration on the trail segment.


#### Trail segments

A new component for ants to associate it with the trail entities it spawns as it moves.

### New entity

A new entity is also being added for the trail segments.
It has a position, a rendering component, and an expiring vector.
Every tick the ant moves, a new trail segment is spawned.
When an ant either wins or looses, it will itterate through it's trail segments component,
applying the associated vectors to the signal field.

## Notes

While this is how I am choosing to implement this now, it is possible this could be done with out creating a new entity
by creating a new renderable interface containing a collection of vertices instead of just one vertex like the dot interface.

I've already started it this way, and what is most important right now is to move behavior out of the shared/field file, and into our
entity framework. Once the behaviors of the field are captured in ecs, it wil be easier to change how we interact with the fields.

I will comment further at the end of the day, trying not to leave the update for the morning after.


## Stand down 12-11-24

This is basicly [ready](ready.md), it's a little slower now with the rendered trails, but that can be another task.
The simulation should run faster if the trails are able to be turned off.
TUrning them off in the config file will be pretty easy.
Having a button to turn them on and off may be harder.

Setting this to [ready](ready.md) for review

## 12 12 24

I will be reading the pr diff today.
They look big, but they also contain the bundles.
I don't want to ignore the bundles, but they do create a lot of noise.
I was thinking I could add a sha-sum tracker so new bundles aren't compiled if their source code didn't change.
Sometimes sibilant will make minor changes to the ways functions and what have you are generated.
The compiler could use some work, a source map for one.
debugging when the issue is a macro can be tricky right now.
