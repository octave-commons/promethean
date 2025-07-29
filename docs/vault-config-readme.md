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

## 📦 Recommended Plugins

* Templater
* Kanban
* Dataview (optional)
* Smart Random Note (optional)
* Markdown Format Converter (optional for compatibility)

---

## 🔁 \[\[Wikilink]] Compatibility

If you're contributing documentation to the codebase:

* Enable `Auto-convert [wikilinks](wikilinks) to MD links on export`
* Or use the `Markdown Format Converter` plugin
* All markdown is written to be GitHub-compatible by default, but \[\[Wikilinks]] are preferred internally for Obsidian graph features

---

## 🧠 Design Note

This project treats Obsidian as a *personal cognitive interface*, not a mandatory system dependency. If you don’t use Obsidian, you can ignore this setup. If you do, the vault is already live at the repo root—you just need to enable the parts you care about.

If you're unsure, start with the Kanban.

---

#hashtags: #obsidian #vault #setup #docs #knowledge-graph
