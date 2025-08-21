

# ground tiles

The ground needs to have different characteristics at different points, and different colorings. 
Some spots need to be easier to walk on, others need to be very hard to walk on.

## Requirements

- There is a matrix of tiles that are rendered to the screen
- Tiles have variable characteristics
- Tiles correspond to more than one coordinate point (They are larger than 1x1)


## Tasks

- [x] Implement tile map ✅ 2025-01-12
- [x] Implement tile floor behaviors ✅ 2025-01-12
- [x] implement tile floor graphics ✅ 2025-01-12

## Blockers

- camera
  - While not really a blocker, I would prefer to have a camera [[ready.md]] before this.

## Progress

Not using a matrix because I went with an infinite world, though this opens up a whole new set of problems. I need to implement a chunk loader.

I have tile sprites set up, but there is no tile meta data.

We'll call this done when we have 4 tile types:
- Grass
	- Grass is slow to walk on
- Meadow
	- Meadows are slower to walk on, but they are more beautiful.
- Broken stone road
	- Broken stone roads are faster to walk on than grass, but slower than stone. They are also uglier
- Stone road
	- Stone roads are the fastest to walk on and they are also beautiful.