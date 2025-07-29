# Vault Configuration

This folder contains a minimal Obsidian configuration for the Promethean vault.
Copy the `.obsidian/` directory to the repository root if you want to use the
same baseline setup and enable the included plugins.

```bash
cp -r vault-config/.obsidian .obsidian
```

The configuration only enables the **Kanban** plugin so the board in
`docs/agile/boards/kanban.md` renders properly. After copying the folder,
launch Obsidian and open the repository directory as a vault. Your personal
settings remain local and are not tracked by git. Feel free to install
additional plugins or customize the theme.

## GitHub-Compatible Markdown Settings

Obsidian offers many conveniences that do not always render correctly on
GitHub. To keep documentation readable in both places, enable the following
options in **Settings → Files & Links**:

* **Automatically update internal links** – keeps link paths tidy when files are
  moved.
* **Use [[wikilinks]]** – preferred inside the vault for graph navigation.
* **Default location for new attachments → Same folder as current file** – avoids
  absolute paths.

Then, install the optional **Markdown Format Converter** plugin and run the
`Convert all to Markdown` command before committing docs. This converts
`[[wikilinks]]` to standard `[text](link.md)` syntax so everything renders on
GitHub without broken links.

If you prefer an automated approach, you can add a `markdownlint` or `Prettier`
configuration in your editor to normalize code fences and line breaks. The repo
does not currently enforce a style, but consistent formatting makes diffs
cleaner.

#hashtags: #obsidian #vault

## Automated Wikilink Conversion

A small script `scripts/convert_wikilinks.py` converts `[[wikilinks]]` to standard markdown links. The repository provides a `.pre-commit-config.yaml` that runs this script automatically before each commit.

Install the `pre-commit` tool and enable the hook:

```bash
pip install pre-commit
pre-commit install
```

From then on, any changed markdown files will have their wikilinks rewritten when you commit.
