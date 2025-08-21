## 🛠️ Task: Add starter notes - eidolon_fields, cephalon_inner_monologue

Create initial documentation for two key areas of the emotional model.
`eidolon_fields.md` should outline the concept of the **Eidolon Field** and
describe each layer’s purpose. `cephalon_inner_monologue.md` introduces the
Cephalon agent’s reasoning loop and how fragments are stored for reflection.
Write introductory documentation for two core concepts: **eidolon_fields** and
**cephalon_inner_monologue**. These notes will serve as a reference for future
implementation work in the Eidolon and Cephalon services. Place the notes in
`docs/notes/` so they are available to the vault and link them from the
`docs/unique/index.md` file.

---

## 🎯 Goals

- Establish clear introductory docs for the emotional framework
- Highlight how the Eidolon Field layers map to emotional dimensions
- Explain Cephalon's internal monologue cycle at a high level
- Provide a high level description of what **eidolon_fields** represent and how
they influence emotional state.
- Document the purpose of **cephalon_inner_monologue** and how it interacts with
the Eidolon field during agent reasoning.
- Establish a canonical location in `docs/notes/` for further deep dives.

---

## 📦 Requirements
- [ ] Create `docs/notes/eidolon_fields.md` with an overview section and bullet
list of key properties.
- [ ] Create `docs/notes/cephalon_inner_monologue.md` describing the monologue
loop and its inputs/outputs.
- [ ] Link both notes from `docs/unique/index.md` so they appear in the
knowledge base.
- [ ] Keep each note under 2 pages of markdown with clear headings.

- [ ] Include reference links to `pseudo/eidolon-field-scratchpad.lisp`
- [ ] Use [[wikilinks.md]] so notes connect to existing math docs

---

## 📋 Subtasks
- [ ] Draft each note in the vault using [[wikilinks.md]] for related concepts.
- [ ] Convert wikilinks to standard markdown before committing.
- [ ] Commit notes and update the index file.

- [ ] Draft bullet-point summaries for each layer (8 total)
- [ ] Describe Cephalon's reflection loop and memory storage
- [ ] Commit the new notes and link them from relevant tasks

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban.md]]
#ready
