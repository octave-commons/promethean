# 🧠 Promethean Obsidian Vault Setup

This repo doubles as an Obsidian vault.

Obsidian is not required to work with the Promethean codebase, but it provides:

* A navigable knowledge graph
* Embedded kanban + task tracking
* Visual context across cognitive modules

---

## 🧰 Minimal Vault Setup (Optional)

1. Install Obsidian
2. Clone this repository
3. Open the project root as a vault
4. Copy `vault-config/.obsidian/` to the root (if you want a baseline config)

```bash
cp -r vault-config/.obsidian .obsidian
```

---

## 🏗️ Generate Service Doc Stubs

Keep documentation aligned with the current services by generating placeholder files:

```bash
pnpm run build:docs
```

This creates `docs/services/<service>/AGENTS.md` entries linking back to their implementations.

---

## 📦 Recommended Plugins

* Kanban 
	- Make the [[kanban]] look like a board
- consistent links and attachments 
	- Solves the problem `[[WikiLinks.md]]` would solve if you didn't care about your board links working on github
	- Allows you to move notes and the link location will update automaticly.

---

## 🔁 \$\[Wikilink]$ Compatibility

If you're contributing documentation to the codebase, Obsidian allows the
`[[Wikilink.md]]` short hand for making notes by default. So `[[docname.md]]`
goes to the nearest doc  in the tree with that name. This is not compatible
with github. So use the following settings:

* Disable `Use [[wikilinks.md]]`
- Change `New link format` to `relative`
* All markdown is written to be GitHub-compatible by default

You'll still be able to use the shorthand, Obsidian will just expand to a markdown link.
```
# With wikilinks disabled and New link format = Relative:
typing [kanban](kanban.md) → [kanban](agile/boards/kanban.md)

# With wikilinks disabled, and new link format = Shortest if possible
# assuming you don't have another file in your vault called `kanban.md`
typing [kanban](kanban.md) → [kanban](kanban.md) 


# With wikilinks enabled:
typing [kanban](kanban.md) → [kanban](kanban.md) (requires conversion to work on GitHub)
```

## 🧠 Design Note

This project treats Obsidian as a *personal cognitive interface*, not a mandatory system dependency. If you don’t use Obsidian, you can ignore this setup. If you do, the vault is already live at the repo root—you just need to enable the parts you care about.

If you're unsure, start with the Kanban.

---

#hashtags: #obsidian #vault #setup #docs #knowledge-graph
