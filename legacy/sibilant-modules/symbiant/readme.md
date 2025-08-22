# Symbiants

Symbiants is a Probabalistic (Stoastic) Cellular automata, initially started as a visualization of Ant Colony Optimization algorithims,
it has become a bit more than that.
Currently, a 120 by 120 grid is spawned with 1000 random plants, and one colony of 100 red ants, whos objective is to
eat as many of the plants as possible. Ants can be sated, meaning they have eaten enough food to reproduce upon 
successfully returning to their nest (which is currently not visualized). An ant can also split off to become a new colony, this
is the newest feature of the simulation. This happens when an ant has become very large with out ever reproducing. A new colony
will choose from the list of entity groups (plants and ants currently) a food group. This decision is probabalistic, based on the sum total life of all entities in the group. Entity groups with a large total life, are more likely to be chosen as food groups for new colonies of ants. The automatic speciation of ants is highly unstable right now, it is currently under going optimizations, because as soon as it happens, the game begins to slow down. This is because the weights that the ants use to make decisions are itterated through one by one to be updated.

Keep posted, highly wip.

# How do I run it?

run this in a a terminal (git bash should work for windows)
Requires node js
```bash
git clone https://github.com/riatzukiza/symbiant.git
cd symbiants
npm install
npm start
```

If this doesn't work, please submit an issue, I have not tested this on any system aside my own yet, and I would
appriciate the feed back.
# Examples
More to go here soon, for now have a few screen shots
![early stage of sim](https://raw.githubusercontent.com/riatzukiza/symbiant/master/images/early-sim.png)
