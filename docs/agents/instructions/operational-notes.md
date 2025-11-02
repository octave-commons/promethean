## 🧭 Operational Notes

**The Essentials (actually important):**

- Always run bash commands from **package root** - saves so much confusion
- Use `pnpm --filter @promethean-os/<pkg> ...` - keeps things isolated and predictable
- Keep temporary scripts in `pseudo/` - they're experiments, not production code
- Store documentation in `docs/` - keeps knowledge organized
- File changes auto-commit with LLM-generated messages - one less thing to think about

**The "Try to Follow" Rules:**

- Avoid `cd ... && anything...` - it's confusing and error-prone
- Skip dynamic imports unless absolutely necessary
- No class statements - stick to the functional pattern we've established
- Keep documentation **Obsidian-friendly** with `[[wikilinks]]` and Dataviews
- Keep [[HOME]] updated - it's your personal knowledge hub
- Use PM2 for runeffort processes - keeps things running reliably

**When Rules Get in the Way:**

- **Break the rules if they're slowing you down** - This is your project, not a corporate codebase
- **Quick hacks are okay** - Just move them to `pseudo/` or clean them up later
- **Documentation can be rough** - Better to have something than nothing
- **"Good enough" beats "perfect"** - Especially when you're tired or stuck

**Remember:**

- **You're building something massive** - Cut yourself some slack
- **Consistency matters more than perfection** - Small, steady progress wins
- **The tools serve you, not the other way around** - If a process isn't helping, change it
