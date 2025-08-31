---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Codex upgrade with GPT-5"
conversation_id: 68965d5e-ac30-8323-922a-3c8e8eb70978
create_time: 08/08/2025 at 3:26 PM
update_time: 08/08/2025 at 4:01 PM
---

# Title: Codex upgrade with GPT-5

Created: 08/08/2025 at 3:26 PM
Last Updated: 08/08/2025 at 4:01 PM
Chat URL: https://chat.openai.com/c/68965d5e-ac30-8323-922a-3c8e8eb70978


>[!nexus_user] **User** - 08/08/2025 at 3:26 PM
> Did codex get an upgrade too when they added gpt5?
<!-- UID: 547f26a6-9889-4379-843c-1eb58269f891 -->




>[!nexus_agent] **Assistant** - 08/08/2025 at 3:27 PM
> Short answer: **yeah—Codex got the GPT-5 bump.**
> 
> - **Codex Web (the sidebar agent in ChatGPT):** It’s marketed as “powered by our most capable models,” and with today’s launch GPT-5 is the flagship. So Codex Web now runs on GPT-5 as it rolls out to Plus/Pro/Team (Enterprise/Edu next). If you don’t see it yet, it’s just rollout lag. citeturn2view0 
> - **Codex CLI:** **Default model is now `gpt-5`.** Update and log in again if needed. The README and latest release notes call out GPT-5 as the default and available via ChatGPT sign-in. citeturn8view0 
> - **API/dev angle:** OpenAI’s own GPT-5 dev post positions it as their strongest coding model and says Codex CLI is tuned for it. citeturn5view0
> 
> ### Do this
> ```bash
> npm i -g @openai/codex # or: brew install codex
> codex update # make sure you're on the latest
> codex --version
> codex login # Sign in with ChatGPT (Plus/Pro/Team)
> # (optional) force it:
> codex --model gpt-5
> ```
> Refs if you want to read the receipts: GPT-5 page, GPT-5 for devs, Codex overview, and the Codex CLI repo. citeturn1view0turn5view0turn2view0turn8view0
> 
> If you meant **our** “Codex” mode in Promethean: same answer—we can point it at `gpt-5` by default. Want me to flip that in your config?
<!-- UID: 38e11e19-5452-460c-aa87-626f53769e96 -->

---




>[!nexus_user] **User** - 08/08/2025 at 3:28 PM
> is there anything I can do with the CLI as a plus user?
<!-- UID: dfa4a191-0deb-45a1-867d-baca77e20cda -->




>[!nexus_agent] **Assistant** - 08/08/2025 at 3:29 PM
> Short answer: **yes.** As a Plus user you can use the Codex CLI, sign in with your ChatGPT account, and run it on **GPT-5** without setting an API key. citeturn1view0
> 
> # What you can do on Plus
> - **Sign in with ChatGPT (no API key):** `codex` → “Sign in with ChatGPT”. This unlocks the latest models (incl. `gpt-5`) “at no extra cost to your plan.” If you used an API key before, update first and re-login. citeturn1view0 
> - **Ask it to do real work in your repo:** e.g. generate tests, refactor, bulk-rename, security review, etc.: 
>  `codex "Write unit tests for utils/date.ts"` 
>  `codex "Bulk-rename *.jpeg -> *.jpg with git mv"` 
>  `codex exec "explain utils.ts"` citeturn1view0
> - **Control autonomy & safety:** Default is a sandbox (no network, scoped writes). You can tighten/relax with flags or `config.toml`. citeturn1view0
> 
> # Setup (Ubuntu-friendly)
> ```bash
> npm i -g @openai/codex
> codex update && codex --version # ensure > 0.13
> env | grep OPENAI_API_KEY || true # make sure it's NOT set
> codex # then pick “Sign in with ChatGPT”
> ```
> If you get weird auth behavior, just `codex login` again after updating. citeturn1view0
> 
> # Limits & gotchas
> - **Usage limits:** Your runs are governed by ChatGPT Plus tier limits/guardrails (message caps, anti-abuse). Expect GPT-5 access on Plus; rollouts can lag. citeturn2view0
> - **Promo credits:** There *was* a launch promo ($5 API credit for Plus) via the CLI’s sign-in flow; it had a cutoff window. You can try `codex --free`, but don’t count on it now. citeturn3view0
> - **Docs conflict re Team/Enterprise:** Some pages say Team works with ChatGPT sign-in; others exclude it. Plus works either way—you’re fine. (If you ever switch plans, expect the flow to change.) citeturn1view0turn3view0
> 
> If you want **usage-based billing** instead of tying to your Plus plan, export `OPENAI_API_KEY` and run Codex that way. But for you, signing in with ChatGPT is the quickest path. citeturn1view0
> 
> # Quick sanity test
> ```bash
> cd your-repo
> codex "Create a small script that lists the 10 largest files and add it under scripts/largest.sh with a Makefile target"
> ```
> Approve the plan, watch it run tests/commands in the sandbox, review the diffs, done. citeturn1view0
> 
> #hashtags
> #codex #cli #chatgptplus #gpt5 #devtools
<!-- UID: ec40f2c0-5561-42bd-964b-7cc2f46563eb -->

---


