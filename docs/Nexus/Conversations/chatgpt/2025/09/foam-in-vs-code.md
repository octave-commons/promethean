---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Foam in VS Code"
conversation_id: 68b6fad2-0934-8327-8df9-206211c2aa42
create_time: 09/02/2025 at 9:10 AM
update_time: 09/02/2025 at 9:19 AM
---

# Title: Foam in VS Code

Created: 09/02/2025 at 9:10 AM
Last Updated: 09/02/2025 at 9:19 AM
Chat URL: https://chat.openai.com/c/68b6fad2-0934-8327-8df9-206211c2aa42


>[!nexus_user] **User** - 09/02/2025 at 9:10 AM
> vs code foam
<!-- UID: 60c046e2-77ac-4380-a871-e916e948a700 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:10 AM
> ​Foam is an open-source personal knowledge management (PKM) system built on Visual Studio Code (VS Code). It enables you to create a local, Markdown-based knowledge base with features inspired by tools like Roam Research and Obsidian. Foam integrates seamlessly with VS Code, allowing you to leverage its ecosystem and extensions for an enhanced note-taking experience.
> 
> ---
> 
> ### 🧠 Core Features
> 
> - **Markdown-Based Notes**: Write and organize your notes using Markdown, ensuring simplicity and compatibility.
> - **Wiki**: Create connections between notes using `[[wiki]]`, facilitating a networked thought process.
> - **Graph Visualization**: Visualize the relationships between your notes through an interactive graph.
> - **Back Panel**: Easily see which notes reference the current note, aiding in context and navigation.
> - **Templates**: Utilize custom templates to standardize note creation and maintain consistency.
> - **Daily Notes**: Maintain a daily journal or log with automatically generated daily note files.
> - **Tag Explorer**: Organize and navigate your notes using tags, including support for hierarchical tags.
> - **Orphans and Placeholders Panels**: Identify notes without (orphans) and without corresponding notes (placeholders) to maintain a well-connected knowledge base.
> - **Link Autocompletion and Sync**: Benefit from intelligent link suggestions and automatic updates to when files are renamed.
> 
> ---
> 
> ### 🚀 Getting Started
> 
> 1. **Install Foam**:
>  - Open VS Code.
>  - Press `Ctrl+P` (or `Cmd+P` on macOS) to open the Quick Open dialog.
>  - Enter `ext install foam.foam-vscode` and press Enter to install the Foam extension.
> 
> 2. **Create a New Foam Workspace**:
>  - Visit the [foam-template repository](https://github.com/foambubble/foam-template).
>  - Click on "Use this template" to create a new repository based on the template.
>  - Clone your new repository to your local machine.
>  - Open the cloned repository in VS Code.
> 
> 3. **Install Recommended Extensions**:
>  - When prompted by VS Code, install all recommended extensions to enhance your Foam experience.
>  - These may include extensions like Markdown All in One, Prettier, and others that complement Foam's functionality.
> 
> 4. **Customize Your Workspace**:
>  - Modify the `.vscode/settings.json` file to tailor Foam to your preferences.
>  - For example, you can set the default directory for new notes, configure the format for daily notes, and adjust other settings to suit your workflow.
> 
> ---
> 
> ### 🔧 Recommended Extensions
> 
> To further enhance your Foam setup, consider installing the following extensions:
> 
> - **Markdown All in One**: Provides comprehensive Markdown editing features.
> - **Prettier**: Automatically formats your code and Markdown files for consistency.
> - **Markdown Preview Mermaid Support**: Enables rendering of Mermaid diagrams within Markdown previews.
> - **Markdown Emoji**: Adds support for emoji syntax in Markdown files.
> - **Excalidraw Integration**: Allows for sketching and embedding diagrams directly into your notes.
> - **Todo Tree**: Helps you manage and navigate TODO comments within your workspace.
> 
> For a comprehensive list and installation instructions, refer to the [Foam Recommended Extensions](https://foambubble.github.io/foam/user/getting-started/recommended-extensions.html) page.
> 
> ---
> 
> ### 🧩 Integration with Logseq
> 
> If you're interested in combining Foam with Logseq, a privacy-first, open-source knowledge base, you can use the [Loam extension](https://marketplace.visualstudio.com/items?itemName=ciceroisback.loam). Loam is a fork of Foam that enhances compatibility with Logseq, allowing you to open your Logseq folder in VS Code and enjoy a similar note-taking experience. This integration enables you to leverage the strengths of both tools in your workflow.
> 
> ---
> 
> ### ⚙️ Advanced Configuration
> 
> For users seeking a more tailored setup, you can customize various aspects of Foam through the `settings.json` file. For example:
> 
> ```json
> {
>  "foam.openDailyNote.directory": "journal",
>  "foam.openDailyNote.titleFormat": "fullDate",
>  "foam.files.newNotePath": "currentDir",
>  "foam.graph.titleMaxLength": 24,
>  "foam..hover.enable": true,
>  "foam..sync.enable": true
> }
> ```
> 
> These settings adjust the behavior of daily notes, define where new notes are created, and configure the appearance and functionality of the graph and . For a more extensive configuration example, you can refer to this [VS Code Foam settings gist](https://gist.github.com/fredgrott/adeec519e9c763ea62a1c80dcd26963a).
> 
> ---
> 
> ### 📚 Additional Resources
> 
> - **Foam Documentation**: Explore detailed guides and tutorials at [foambubble.github.io/foam](https://foambubble.github.io/foam/).
> - **Foam GitHub Repository**: Access the source code and contribute at [github.com/foambubble/foam](https://github.com/foambubble/foam).
> - **Community Support**: Join the Foam community on [Discord](https://foambubble.github.io/foam/#join-the-foam-community) to connect with other users and contributors.
> 
> ---
> 
> Foam offers a flexible and extensible platform for managing your personal knowledge base within VS Code. By leveraging its features and integrating with other tools like Logseq, you can create a powerful system tailored to your note-taking and knowledge management needs.
> 
> ---
<!-- UID: 09a91d86-1add-462a-a8e1-b1a2669db617 -->

---




>[!nexus_user] **User** - 09/02/2025 at 9:17 AM
> you know I'm considering it. I like obsidian but... I can't root the vault at the root of a mono repo with a lot of node_modules folders... it lags... so my vault is always rooted in ./docs, which makes the paths it makes kinda wierd, I can't incorperate markdown files outside of docs, I can't easily refer to chunks of code...
<!-- UID: a4d566c3-6a39-4ebf-8e86-de38bfc96b8b -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:18 AM
> Yeah, that friction is real. Obsidian chokes on monorepos because it eagerly crawls everything—including every `node_modules/**` and stray `README.md`—and it still doesn’t give you a clean, repo-root vault that can *reliably* ignore those trees. There are partial workarounds, but they’re duct tape. Foam + VS Code fits the monorepo mental model better.
> 
> # Call it straight
> - **Obsidian in a monorepo** 
>  - You *can* exclude folders in Settings → Files & Links → “Excluded files,” but indexing/parsers still tend to walk the tree and people routinely report lag or lockups with `node_modules`. This has been a long-standing pain on the forum. cite 
>  - Sym to pull in paths outside the vault are “supported” but officially discouraged because of corruption risk and weird edge cases. cite 
>  - Community plugins like **File Ignore** try to emulate a `.gitignore`—by *renaming/hiding* things under the hood—useful but hacky if other tools depend on exact paths. Mixed reception. cite
> - **Foam in VS Code (rooted at repo)** 
>  - Foam gives you Obsidian-like PKM (wiki, back, graph) but rides on VS Code’s workspace, so you can root at `/` of the monorepo and surgically exclude `node_modules/**` from *Explorer, search, and file watching*. That’s the critical difference. cite 
>  - Wiki stay Markdown-compatible via link reference definitions, so you’re not boxed into a special format. cite
> 
> # A pragmatic plan
> 
> ## Option A — Stay in Obsidian (minimize pain)
> If you really want to keep Obsidian:
> 
> 1) Exclude aggressively 
> Settings → Files & Links → **Excluded files** → add `node_modules/`, `.git/`, `dist/`, etc. It helps UI features (search/graph), but may not fix startup/index lag. cite
> 
> 2) Use a targeted symlink folder 
> Create a folder *inside* the vault (e.g., `docs/_/`) and symlink only the code areas you want discoverable (e.g., `packages/core/src`). It’s “supported,” but back it up and avoid sym `.obsidian/`. cite
> 
> 3) If you must: try **File Ignore** 
> It gives `.gitignore`-style rules. Be aware it works by toggling hidden flags / renames, which can upset other tooling. cite
> 
> Net: still fragile. You’ll keep fighting the crawler.
> 
> ## Option B — Move to Foam (my recommendation here)
> Root your PKM at the monorepo and let VS Code handle scale.
> 
> **1) Create a `.vscode/settings.json` at repo root:**
> ```json
> {
>  "files.exclude": {
>  "**/node_modules": true,
>  "**/.git": true,
>  "**/dist": true,
>  "**/build": true
>  },
>  "search.exclude": {
>  "**/node_modules": true,
>  "**/.git": true,
>  "**/dist": true,
>  "**/build": true
>  },
>  "files.watcherExclude": {
>  "**/node_modules/**": true,
>  "**/.git/**": true,
>  "**/dist/**": true,
>  "**/build/**": true
>  },
>  "markdown.updateLinksOnFileMove.enabled": "always"
> }
> ```
> This prevents crawling hell (Explorer, search, *and* file watcher). VS Code documents these knobs; they’re standard. cite
> 
> **2) Install Foam + Markdown tooling**
> - **Foam** (wiki, back, graph). cite 
> - **Markdown All in One** (TOC, shortcuts, link updates). cite 
> - *(Optional)* “Markdown Preview Include Files” if you want transclusion like `!!!include(path/file.md)!!!` in previews. cite
> 
> **3) Referencing code (the right way)**
> - **Direct to files** work with relative paths from any note because your workspace is the repo: `[router](packages/web/src/router.ts)`. VS Code will open it instantly. cite 
> - **Anchors/sections**: headers in Markdown support `#anchor` across files. cite 
> - **Specific lines:** GitHub perma like `#L10-L30` are reliable for code review docs; VS Code’s Markdown doesn’t consistently jump to lines for non-md files yet (known limitation). Use perma when precision matters. cite 
> - **Inline live snippets:** if you want the *snippet content* embedded in a note and kept in sync, use an include extension (e.g., the “Markdown Snippet Include” workflow with snippet markers in source). Trade-off: you annotate source with snippet tags. citeturn4view0
> 
> **4) Multi-root (if you insist on a `docs/` island)**
> Open a VS Code **multi-root workspace**: one root at repo `/`, one at `/docs`. You keep Foam graph concentrated in `docs/` but still link to code files in sibling roots. cite
> 
> # Bottom line
> - If you want repo-root, easy code , and zero `node_modules` drama: **Foam in VS Code** is the saner default. 
> - If you *must* stay in Obsidian, you’ll be juggling exclusions, sym, and maybe a plugin that rewrites paths. It can work—until it doesn’t.
> 
> If you want, I’ll sketch a minimal Foam template for your repo (settings, recommended extensions, a `notes/` seed, and examples showing file vs. included snippets). No fluff.
> 
> #hashtags
> #pkm #foam #vscode #obsidian #monorepo #documentation #notes #devex
<!-- UID: 8c8e2945-a24d-4339-8cdb-bd36a8907c32 -->

---


