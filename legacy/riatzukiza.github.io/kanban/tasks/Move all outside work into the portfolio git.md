To put the full depth of my work on this lisp framework into view in this portfolio, I want to move the code I wrote in all of the kit framework into this portfolio. This way it is easier for future employers to see exactly how much work went into making this entire framework function the way it does. The work meant for [[Remove duplicate code included in headers..md]] and [[Cull duplicate macros.md]] will be tracked in this issue. May as well call it an [[Epic.md]], it could be a lot of work to move *everything* into here. 

# Epic: Move Kit Framework to Portfolio

## Tasks

* [[Cull duplicate macros.md]]
* [[Remove duplicate code included in headers..md]]
* [[Rewrite andy lib in lisp.md]]

## Context:
[[Cull duplicate macros.md]], I have implemented many macros that share the same name, causing issues at runtime. For instance, the `remember` macro was implemented differently, which broke my code in some cases.

This issue is related to [[Move all outside work into the portfolio git.md|kanban/tasks/Move all outside work into the portfolio git]] and [[Remove duplicate code included in headers..md]], and may be marked as #duplicate or possibly #rejected in favor of another task.

## New Features

* Move the kit macros into the portfolio
* Refactor the kit macros a bit
* Rewrite Andy's gl library in Lisp
* Define interfaces for every class in the library
* Obstacles simulation works as before
* Performance is not impacted by new implementation

## Tasks

* [ ] [[Andy's gl library]]: Move the lib into portfolio
* [ ] [[Lisp interfaces]]: Define interfaces for every class in the library

## New Features

* Add a [[project.md]] page to the website
* [[Side scroller.md]]
* Game of life
* [[file explorer.md]]
* [[chat app MVP.md]]
* [[Find unknown content warnings.md]]

## Tasks

* [ ] [[config system.md]]: Implement a [[config system.md]]
* [ ] [[Entity inspector]]: Implement an entity inspector feature
* [ ] [[Github pages static site]]: Create a Github pages static site
* [ ] [[Trail entities]]: Implement trail entities
* [ ] [[Simulation reset.md]]: Reset the simulation to its original state

## New Features

* Add a [[project.md]] page to the website
* [[Side scroller.md]]
* Game of life
* [[file explorer.md]]
* [[chat app MVP.md]]
* [[Find unknown content warnings.md]]

The dev code that watches, compiles, bundles, and serves the website would have a difficult time accessing the code that is in the #shared and #client modules, as browserify currently does some extra work parsing a namespacing system ie "@shared/data-structures/lists.js" refers to the code in [[list.js]] and everything in that folder uses that "@shared" prefix.

## Tasks

- [ ] [[Cull duplicate macros.md]]
- [ ] [[Remove duplicate code included in headers..md]]
- [ ] [[Rewrite andy lib in lisp.md]]

#[[Epic.md]]