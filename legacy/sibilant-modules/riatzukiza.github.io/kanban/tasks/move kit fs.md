move kit fs into shared, since browserify can use web fs it doesn't have to change for web applications

## Requirements

- Kit fs is now in shared lib folder.
- code using kit fs is rewritten to accept the new location

## Tasks

- [ ] copy library
- [ ] change require statements
- [ ]  Create bundles that are consumable by both node and browsers
- [ ] Update dev code, templates, and static file server middleware to use  kit fs from the new location