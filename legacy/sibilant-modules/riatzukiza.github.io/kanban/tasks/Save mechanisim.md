## Description

We need a save mechanisim for both playability and development convienience. The world generation process takes forever to run, I'd rather it just be ran one time.

Even as I add new elements for world gen, I would like to have a base world to test new entities using the [[placeable entities (rocks, plants, bases)]] mechanisim, then integrate them into world generation after I know the components work as expected.
## Related Epics

- [[Game Mechanics]]
- [[Game UI]]
- [[Game design]]
- [[devops pipeline]]

## Requirements

- Generated worlds may be saved
- Saved worlds may be loaded.
- There is a starting menu that gives you the option to load from a save, or to start a new game.
- New worlds are automatically saved after they are generated.

## Tasks 

- [ ] Implement save mechanic
- [ ] implement loading mechanic
- [ ] Implement start menu
- [ ] Implement save button and menu
- [ ] Implement load button and menu
- [ ] Implement start new world button and menu
## Related links

[Using IndexedDB - Web APIs \| MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)