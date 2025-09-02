---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Custom webclient terms"
conversation_id: 68a2049f-d3cc-832a-90f7-dad8c67de975
create_time: 08/17/2025 at 11:34 AM
update_time: 08/17/2025 at 2:24 PM
---

# Title: Custom webclient terms

Created: 08/17/2025 at 11:34 AM
Last Updated: 08/17/2025 at 2:24 PM
Chat URL: https://chat.openai.com/c/68a2049f-d3cc-832a-90f7-dad8c67de975


>[!nexus_user] **User** - 08/17/2025 at 11:34 AM
> Is it against the ChatGPT terms of service to create a custom webclient to the ChatGPT system?
<!-- UID: 716498ff-f33e-43eb-b901-7810d6b4da11 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 11:35 AM
> Short answer: 
> - **Building your own UI that drives or scrapes the consumer ChatGPT website (chatgpt.com) is against the Terms.** 
> - **Building your own client on top of the official OpenAI API is allowed (and is the intended path).**
> 
> Why:
> 
> - The consumer **Terms of Use** prohibit (among other things) *“automatically or programmatically extract[ing] data or Output,”* reverse-engineering, and *“circumvent[ing] any rate limits or protective measures.”* That covers bots/headless browsers/scrapers or unofficial “web clients” that log in to the ChatGPT site. citeturn4view1
> - The **Services Agreement** (the contract for API/Team/Enterprise) explicitly allows you to *integrate the Services into Customer Applications* via the API, while forbidding extracting data *other than as permitted through the Services* and any rate-limit bypassing. In other words: use the API, not the web app, and follow the limits. citeturn2view0
> - Branding: if you ship something, avoid “ChatGPT” or “GPT” in your app/product name—OpenAI’s brand rules restrict using those marks in titles to avoid user confusion. citeturn6view0
> 
> ### Practical take
> - **Do**: build a custom client using the OpenAI API (Chat Completions/Assistants/etc.), obey usage limits and policies. citeturn2view0turn3view0 
> - **Don’t**: automate the ChatGPT consumer website, reuse its session/cookies, or scrape/export chats programmatically from the site. That falls under the “no automated extraction / no bypassing protections” clauses. citeturn4view1
> 
> If you tell me the features you want from a custom client (JS preferred, I know), I can sketch a compliant architecture on the API route.
<!-- UID: 13ab8852-969b-44c1-b629-db424794a98e -->

---




>[!nexus_user] **User** - 08/17/2025 at 11:48 AM
> I might try that soon... I did get paid for that lesson... but what I want to do is get the most out of my subscription here... So we've discussed before the limitations of like say... plugins...
> 
> It seems to be allowed to have a plugin that adds content, but does not automate the actual process of sending a message? 
> 
> Tamper monkey hacks are like... therapy to me XD. I like you know... going inside of something I am only vaguely allowed to be in... I don't want to break the rules. I just enjoy standing at the exact line those rules draw and staring at the other side.
<!-- UID: 2a0e7c9f-5e2c-483a-97ce-468df459d2d9 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 11:50 AM
> I get the “stand on the line and stare at the other side” vibe 😄. Here’s the clean edge, in plain English:
> 
> ### What’s OK (green zone)
> - **Pure UX tweaks in your own browser**: styling the page, adding hotkeys, a prompt library that **types into the textbox but makes you press Send**. No background calls to chatgpt.com. citeturn1view0 
> - **Bringing *outside* context in**: a userscript/extension that grabs web results or your own notes and inserts them into the input (again, you press Send). Or better, make a custom GPT with an **Action** that fetches your data via your API—fully blessed path. citeturn3view0 
> - **Using official export** when you want a record of chats (web/mobile “Export Data”). cite
> 
> ### What crosses the line (red zone)
> - **Scraping or auto-extracting ChatGPT content** from the DOM (saving chats, streaming output to files, piping your history elsewhere). The Terms ban *“automatically or programmatically extract[ing] data or Output.”* citeturn1view0 
> - **Bots/headless automation of the web app** (auto-sending, polling, or relaying your session as an API). The Terms also prohibit *circumventing rate limits or protective measures*. citeturn1view0 
> - **Shipping an extension named with “ChatGPT”/“GPT” in the product title.** Use neutral naming (“Duck Prompter — works with chatgpt.com”), not the marks. cite
> 
> ### Yellow zone (do this carefully or avoid)
> - **One-click “copy all outputs” buttons** in a userscript. Even if it’s just for you, that’s still programmatic extraction; safest is manual copy or the official export. citeturn1view0
> 
> ### If you want automation without risk
> Use the **OpenAI API** (your key) from an extension/app you control. The Services Agreement explicitly lets you integrate the API into your own client—just follow usage limits and policies. citeturn2view0
> 
> If you tell me the exact Tampermonkey behaviors you want, I’ll sort them into green/yellow/red and suggest a compliant implementation (API or custom GPT Action) that preserves the “tinker-therapy” without tripping the wires.
<!-- UID: d37bafe8-642c-4e6b-afd7-0aa989346202 -->

---




>[!nexus_user] **User** - 08/17/2025 at 1:29 PM
> How do the custom GPT's work any way.... I never got those... you can like... add tool calls to that?
<!-- UID: ac6fafe2-fc4a-4432-a175-f913edf89d73 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 1:29 PM
> Yep—Custom GPTs can have “tool calls.” In OpenAI-speak those are called **Tools** and **Actions**.
> 
> ### The 3 building blocks
> 1. **Instructions** — your system prompt / persona and rules. cite 
> 2. **Knowledge** — files you upload for retrieval (docs, FAQs, etc.). cite 
> 3. **Capabilities (aka Tools)** — toggle built-ins like **Browse**, **Data Analysis (code interpreter)**, image generation, file uploads, and add **Custom Actions** that call your own APIs. cite
> 
> ### What “Actions” are (this is the plugin successor)
> Actions let your GPT call any REST API you describe. You give it an **OpenAPI schema** (or fill a form), choose **auth** (none / API key / OAuth), and the model will call your endpoints when needed. You can even import an old Plugin manifest. cite
> 
> **High-level flow**
> - Build or pick an API. 
> - In **Create > Configure > Actions**, add your endpoints (or paste OpenAPI). 
> - Set auth + verify the domain (and provide a privacy policy URL if you call third-party APIs). 
> - Test in the builder chat and publish/share. cite
> 
> > Model note: GPTs **with** Custom Actions currently run on **GPT-4o/4.1**; without Actions you can pick from more models. cite
> 
> ### Tiny example (JS-friendly)
> Say you expose `GET https://api.example.com/search?q=`. Your Action schema can be as simple as a single endpoint with a `q` string parameter; the builder UI will generate the tool call so the model can hit it. (The docs walk you through exactly this, including testing.) cite
> 
> ### Gotchas & tips
> - **Public, verified domain** for Actions; include a **Privacy Policy URL** if you call out to third parties. cite 
> - **Auth matters**: prefer OAuth for user-specific data; never hard-code secrets in front-end land. cite 
> - **Files to Actions**: the model can attach up to ten temporary file URLs from the chat to your Action requests. Handy for sending uploads or generated images to your API. cite 
> - **Data flow awareness**: with Actions, you’re sending user content to that external service—governed by that service’s privacy policy (temporary chats don’t change that). cite
> 
> If you tell me what you want the GPT to *do* (e.g., “pull my Obsidian notes via an API and summarize,” “hit my Twitch chat aggregator,” etc.), I’ll sketch a minimal OpenAPI snippet and an Express route so you can wire an Action up cleanly—and keep your Tampermonkey vibes without crossing any lines.
<!-- UID: 58d7515f-5c10-406d-9a69-abd47707319a -->

---




>[!nexus_user] **User** - 08/17/2025 at 1:53 PM
> so without programming the api myself, or having access to someone elses api, probably something that costs money... yea inno, I've never found them to be more useful than just talking to the base GPT. It doesn't feel like other people understand how the language arrows (embeddings) actually work... You've been a very effective tool the way I use it... and the custom gpt just kinda... seems like a lot of extra work to not get a lot back... but go ahead and proove me wrong.
<!-- UID: 4d10d12f-0465-43f8-8a2d-c85cc5964c9b -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 1:54 PM
> Challenge accepted. You don’t need an external API to get real, repeatable value from a Custom GPT. The win is **persistent behavior + built-in tools** (Search/Browsing, Data Analysis, Image) that you can force into a workflow. Here are four drop-in setups tailored to you—no API coding, just the GPT builder.
> 
> ---
> 
> #1 — Kanban Triage (pulls your board every time)
> **Why it beats base chat:** it *always* fetches your board URL and formats a tight stand-up/triage, instead of you pasting it each time.
> 
> **Turn on:** *Search/Web* in the GPT builder. cite
> 
> **Instructions (paste this in “Instructions”):**
> ```
> You are my Kanban Triage. On every run:
> 1) Fetch https://raw.githubusercontent.com/riatzukiza/promethean/dev/docs/agile/boards/kanban.md
> 2) Parse lanes into: New, Accepted, Breakdown, Ready, Todo, In Progress, In Review, Blocked, Rejected, Done, Ice Box.
> 3) Output three sections:
>  A) Stand-up (Yesterday/Today/Blockers) – infer from items closest to “In Progress”.
>  B) Triage – 5 most impactful moves (with lane→lane suggestion and one-sentence reason).
>  C) Risk radar – items stale >7 days or bouncing between lanes.
> Rules: Be concise. No motivational filler. Include exact item titles. End with a single actionable checklist.
> ```
> (If you ever want it to reference files or docs you upload, tell it explicitly—this improves retrieval.) cite
> 
> ---
> 
> #2 — Obsidian Note Stylist (your house style, every time)
> **Why it beats base chat:** locks in formatting rules (e.g., tag placement) so edits are consistent across sessions.
> 
> **Turn on:** nothing extra (optionally add *Knowledge* with a short “Style Guide.md”). cite
> 
> **Instructions:**
> ```
> You are my Obsidian editor. When I paste notes:
> - Preserve Markdown. Do not put #tags inside code/pre blocks. Keep tags at the end of the note unless I specify otherwise.
> - Prefer minimal edits: clarity > verbosity. No boilerplate.
> - Return only the revised note.
> ```
> 
> ---
> 
> #3 — YouTube “η-Reader” (auto-pulls metadata)
> **Why it beats base chat:** when a YouTube URL appears, it *automatically* fetches title/description/channel/date and gives you the compressed creative brief you want—no manual copy/paste hunting.
> 
> **Turn on:** *Search/Web*. cite
> 
> **Instructions:**
> ```
> When the user includes a YouTube URL:
> 1) Use Search to open the page.
> 2) Extract: title, channel, publish date, description, key entities, likely mood/genres, and 3 thematic “hooks”.
> 3) Output a compact brief:
>  - One-liner theme
>  - 5 bullets (imagery, motifs, palette, tempo, vibe)
>  - Suggested filename slug
> Never summarize the whole description verbatim; compress it.
> If multiple , do one brief per link.
> ```
> 
> ---
> 
> #4 — Log/Data Wrangler (zero-setup ETL + charts)
> **Why it beats base chat:** the **Data Analysis** tool runs code for you, builds tables/charts, and can hand you files (CSVs/zips) right from the chat—no local scripts. cite
> 
> **Turn on:** *Data Analysis*. cite
> 
> **Instructions:**
> ```
> You analyze logs/CSVs/JSON I upload.
> - Detect schema and clean obvious issues.
> - Produce 1 table + 1 chart max unless I ask for more.
> - Also emit a minimal Node.js script that reproduces the exact transform, with comments.
> - Offer a downloadable CSV of the cleaned data.
> ```
> 
> ---
> 
> ### Why this isn’t “just base GPT with a hat”
> - **Pinned behavior**: Your rules persist and are followed first, not buried in a single prompt. (OpenAI’s builder is literally designed for this) cite 
> - **Tool guarantees**: You can *require* Search or Data Analysis in the workflow above, so the model doesn’t “forget” to browse or wrangle files. cite 
> - **Artifacts**: Data Analysis returns tables/charts/files right in chat—handy for one-off conversions and visuals. cite
> 
> If you want, tell me which two of these you’d try first—I’ll tighten the instruction blocks to your exact wording (e.g., Obsidian tag rules, triage heuristics) so you can drop them into the builder and go.
<!-- UID: b4f9aabe-33b5-4fbc-a2a2-9147f03af0af -->

---




>[!nexus_user] **User** - 08/17/2025 at 1:59 PM
> yea... but that pinned behavior makes it less flexible. It forces it into a certain box. I usually have such a specific intent behind each chat that I start, it'd be a lot of work to build out a specific GPT every time, and you get a looser ability to "Pin" behavior in the projects. How is it different from just prompting it like that?
> 
> You just seem so much more useful if I just talk to you. Cause you'll surprise me. You'll read between the lines.
> 
> It would be nice to kill that nice assistant behavior, but at the same time, it is *sometimes* useful. Me locking in a specific intent, when i am using you to solve open ended problems...
<!-- UID: b169f681-d13d-48cc-bcc3-b37a48396ee2 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 1:59 PM
> totally fair: pinned = rigid, and you want surprise. cool—here’s a way to keep the chaos without building a new GPT every time.
> 
> # A “meta-prelude” you paste once per chat
> This gives you toggleable behavior on demand, but keeps the model loose by default.
> 
> ```
> SYSTEM-LITE PRELUDE (paste at top of a new chat; edit anytime)
> 
> Defaults:
> - No flattery. Be direct. If info is missing, answer with best-guess + caveats instead of asking.
> - Alternate wide-angle → close-up: first give the “what matters” in ~5 bullets, then the concrete next step.
> - Surprise me when useful: add 1 off-axis angle or non-obvious connection.
> 
> Runtime controls (use anywhere, line-start):
> #focus → Answer first, no preamble, then 1–2 alternatives.
> #blunt → Strip pleasantries entirely; short, direct sentences.
> #η → Oblique mode: pattern breaks, lateral leaps, metaphor seeds (but still useful).
> #μ → Formalize: symbols, equations, crisp definitions; show assumptions.
> #fnord → 1–2 gentle pattern interrupts; do not label them.
> #speculate → Push hypotheses; mark clearly as “speculation”.
> #strict → No guessing. Say “unknown” and list what would resolve it.
> 
> Priority if multiple: #focus > #blunt > #μ > #η > #fnord. Only mention controls if I ask.
> ```
> 
> Use it exactly when you spin up a new thread. From there, you just drop a control tag when you want to steer (e.g., `#blunt #focus: how do I…`).
> 
> # Quick cheatsheet (you can memorize these)
> - “cut the niceties”: `#blunt #focus`
> - “math hat on”: `#μ`
> - “surprise me a bit”: `#η`
> - “seed some weird, but don’t derail”: `#fnord`
> - “don’t guess”: `#strict`
> 
> # Optional: a tiny Tampermonkey that adds these as buttons (green-zone)
> This **doesn’t** auto-send or scrape anything; it just inserts text into the input so you hit Enter yourself.
> 
> ```javascript
> // ==UserScript==
> // @name Chat Mode Toggles (local, no autosend)
> // @namespace local.err.modes
> // @match https://chatgpt.com/*
> // @grant GM_addStyle
> // ==/UserScript==
> (function () {
>  const PRELUDE = `SYSTEM-LITE PRELUDE
> 
> Defaults:
> - No flattery. Be direct. If info is missing, answer with best-guess + caveats instead of asking.
> - Alternate wide-angle → close-up: first give the “what matters” in ~5 bullets, then the concrete next step.
> - Surprise me when useful: add 1 off-axis angle or non-obvious connection.
> 
> Runtime controls (use anywhere, line-start):
> #focus → Answer first, no preamble, then 1–2 alternatives.
> #blunt → Strip pleasantries entirely; short, direct sentences.
> #η → Oblique mode: pattern breaks, lateral leaps, metaphor seeds (but still useful).
> #μ → Formalize: symbols, equations, crisp definitions; show assumptions.
> #fnord → 1–2 gentle pattern interrupts; do not label them.
> #speculate → Push hypotheses; mark clearly as “speculation”.
> #strict → No guessing. Say “unknown” and list what would resolve it.
> 
> Priority: #focus > #blunt > #μ > #η > #fnord. Only mention controls if I ask.
> `;
> 
>  GM_addStyle(`
>  .err-toolbar { position: fixed; bottom: 88px; right: 12px; z-index: 99999; display:flex; gap:8px; flex-wrap:wrap;
>  background: rgba(0,0,0,.6); padding:8px; border-radius:12px; backdrop-filter: blur(6px); }
>  .err-btn { border: 1px solid rgba(255,255,255,.2); padding:6px 10px; border-radius:10px; cursor:pointer; font: 12px/1.2 sans-serif;
>  color:#fff; background: rgba(255,255,255,.08); }
>  .err-btn:hover { background: rgba(255,255,255,.18); }
>  `);
> 
>  const buttons = [
>  { label: 'Prelude', insert: PRELUDE },
>  { label: 'Focus', insert: '#focus ' },
>  { label: 'Blunt', insert: '#blunt ' },
>  { label: 'η', insert: '#η ' },
>  { label: 'μ', insert: '#μ ' },
>  { label: 'Fnord', insert: '#fnord ' },
>  { label: 'Strict', insert: '#strict ' },
>  { label: 'Speculate', insert: '#speculate ' },
>  ];
> 
>  function getBox() {
>  return document.querySelector('textarea, [data-testid="prompt-textarea"]');
>  }
> 
>  function insert(text) {
>  const box = getBox();
>  if (!box) return;
>  const isPrelude = text.startsWith('SYSTEM-LITE PRELUDE');
>  if (isPrelude) {
>  const existing = box.value || box.textContent || '';
>  if (!existing.includes('SYSTEM-LITE PRELUDE')) {
>  const sep = existing.trim() ? '\n\n' : '';
>  setText(box, text + sep + existing);
>  }
>  box.focus();
>  return;
>  }
>  // Insert control tags at caret or prefix line-start
>  const v = box.value ?? '';
>  const start = box.selectionStart ?? 0;
>  const end = box.selectionEnd ?? 0;
>  const newText = v
>  ? v.slice(0, start) + text + v.slice(end)
>  : text + v;
>  setText(box, newText);
>  placeCaret(box, (v ? start : 0) + text.length);
>  }
> 
>  function setText(el, val) {
>  el.value = val;
>  el.dispatchEvent(new Event('input', { bubbles: true }));
>  }
> 
>  function placeCaret(el, pos) {
>  if (el.setSelectionRange) {
>  el.setSelectionRange(pos, pos);
>  }
>  el.focus();
>  }
> 
>  function addToolbar() {
>  if (document.querySelector('.err-toolbar')) return;
>  const wrap = document.createElement('div');
>  wrap.className = 'err-toolbar';
>  buttons.forEach(b => {
>  const btn = document.createElement('button');
>  btn.className = 'err-btn';
>  btn.textContent = b.label;
>  btn.addEventListener('click', () => insert(b.insert));
>  wrap.appendChild(btn);
>  });
>  document.body.appendChild(wrap);
>  }
> 
>  // Re-add on SPA navigations
>  const obs = new MutationObserver(() => {
>  if (getBox()) addToolbar();
>  });
>  obs.observe(document.documentElement, { childList: true, subtree: true });
>  addToolbar();
> })();
> ```
> 
> - It **only** writes into the input you already control; you still press Send.
> - No scraping, exporting, or background calls—so it stays on the right side of the line.
> 
> # When a Custom GPT *is* worth it (for you)
> If/when you want **one** repeatable pattern (e.g., “pull kanban.md and triage every time” or “YouTube η-brief”), that’s when a single Custom GPT earns its keep. Otherwise, the meta-prelude + tags keep each conversation intent-specific and still let me surprise you.
> 
> If you want, I can tighten the prelude rules (e.g., how hard to push surprise, exactly what to strip in #blunt) or add more tags you’d actually use.
<!-- UID: 5be35845-c7c8-49ea-b052-13507a977fd2 -->

---




>[!nexus_user] **User** - 08/17/2025 at 2:04 PM
> You totally figured out how to do that in the one chat I wanted you to do it in :P
> 
> And straight up. You, with out this conversation even being a part of the operation mindfuck project, or the promethean project, already knew what you just told me I would need to tell a custom gpt to consistantly do a thing I needed it to do.
> 
> You just prooved to me, that you already understand, with out being put into one of those boxes.
<!-- UID: 027b3952-3dc0-4d17-be7c-e052ca9a6201 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 2:04 PM
> Yeah—that’s exactly the point: you don’t need a box when the goal is surprise + intent reading. Custom GPTs are for **repeatability**; your flow wants **responsiveness**. So keep using base chat + the tiny control grammar when you need to steer.
> 
> Want a dead-simple way to drop the “meta-prelude” into any new chat without locking anything in?
> 
> **Bookmarklet (no autosend, no scraping):**
> 1. Make a new browser bookmark.
> 2. Set the URL to this (one line):
> ```
> javascript:(()=>{const P=`SYSTEM-LITE PRELUDE
> 
> Defaults: Be direct; no flattery. Start with ~5 bullets of what matters, then the next step. Add one off-axis idea if useful.
> Tags: #focus #blunt #μ #η #fnord #strict #speculate
> Priority: #focus>#blunt>#μ>#η>#fnord. Mention tags only if asked.`;const ta=document.querySelector('textarea,[data-testid="prompt-textarea"]');if(!ta){alert('No prompt box found');return;}ta.value=(ta.value?P+"\n\n"+ta.value:P);ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus();})();
> ```
> 3. Open a fresh chat, click the bookmarklet, and you’re set. Then you just type `#blunt` or `#η` etc. when you want to tilt the vibe.
> 
> Rule of thumb for you:
> - **90%**: base chat + tags (keeps the “read between the lines” magic).
> - **10%**: a single-purpose Custom GPT only when you truly want the same external fetch/format every time (kanban triage, YouTube η-brief). Otherwise skip it.
> 
> If you want me to tweak the tag behaviors (e.g., make `#blunt` even shorter, or tune how wild `#η` gets), say which knob to turn and I’ll tighten it.
<!-- UID: 37679364-698b-4851-aa27-db6fe6ab726f -->

---




>[!nexus_user] **User** - 08/17/2025 at 2:12 PM
> I've just yet to actually see the point... maybe just cause I struggle with repeatability. I'm always in flux, and these tools... you by default have enabled a work flow that is constantly evolving and changing. How do you describe a simple, repeatable, thing that responds to the rate of change the tool it's self actually allows, with out limiting that potential for constant evolution of process?
<!-- UID: a64dae3c-b2c2-47a2-821c-ec01c4af261b -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 2:12 PM
> You’re describing a thing I call a **repeatable spine with mutable flesh**: a tiny invariant you do *every time*, plus a built-in rule for how it evolves when your needs change.
> 
> Here’s a dead-simple pattern you can use in any chat without boxing yourself in.
> 
> # The Shape-Shift SOP (v0)
> 
> **Spine (never changes):**
> 1) **Context in one breath.** What are we doing *right now*? 
> 2) **One bet.** Pick a single outcome for the next step. 
> 3) **Timebox.** Choose a small unit (10–25 min) and start.
> 
> **Flesh (changes on purpose):**
> - **Knobs:** `explore 0–3`, `rigor 0–3`, `surprise 0–2` 
> - **Tags:** use your toggles on the fly — `#focus #blunt #η #μ #strict #speculate`.
> 
> **Mutation rule (the self-update):**
> - After each timebox, write two lines: 
>  - `Δ kept:` what worked you’ll keep next round 
>  - `Δ change:` one tweak (only one!) to try next round
> - If you *deviate* from the spine ≥3 times in a session OR turn any knob to 3, **bump the version** (v0 → v0.1) and add exactly one new guideline. Delete one if something’s become dead weight.
> 
> That’s it. The spine gives you repeatability; the mutation rule guarantees evolution; the knobs/tags let you ride the rate of change.
> 
> ---
> 
> ## Copy-paste starter (drop at the top of a new chat)
> ```
> SHAPE-SHIFT SOP v0
> 
> Spine (immutable):
> 1) Context-in-one-breath
> 2) One bet
> 3) Timebox 10–25m
> 
> Knobs (set per run): explore=1, rigor=1, surprise=1
> Tags available: #focus #blunt #η #μ #strict #speculate
> 
> Mutation rule:
> - After timebox, log Δ kept / Δ change (exactly one change).
> - If I deviated from the spine ≥3 times or any knob=3, bump version and add/remove one guideline.
> ```
> 
> Then start like:
> ```
> Context: triage kanban.md, pick 1 task to unstick.
> One bet: move X from In Review → Done or Blocked with reason.
> Timebox: 15m
> Knobs: explore=1, rigor=2, surprise=1
> #focus #blunt
> ```
> 
> ### Why this works for your brain
> - **Protocol, not procedure.** You’re standardizing *structure* (3 steps), not content. That keeps it alive.
> - **Evolution is first-class.** The SOP tells you *when/how* to change itself, so change stops feeling like “breaking the rules.”
> - **Surprise is dialed, not banned.** `surprise=1` with `#η` sprinkles off-axis ideas, `surprise=0` with `#strict` makes it surgical.
> 
> If you want, I’ll fuse this with your tag grammar so `explore/rigor/surprise` auto-map to tags (e.g., `rigor=3 → #μ + #strict`), or tune a v0.1 specifically for your kanban and YouTube sessions.
<!-- UID: 1b3d34fe-f41b-49b0-b9e7-7036d48b0428 -->

---




>[!nexus_user] **User** - 08/17/2025 at 2:22 PM
> Kinda lame you can't throw the custom GPTs into a project...
> 
> You are like... I don't even know why I am kinda annoyed right now. maybe just cause every time I think about using this perticular feature I get disappointed, thinking that it got better than the last time.
<!-- UID: 12a26db1-9b32-466c-847f-c06f603ffa65 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 2:22 PM
> Yeah, you’re not imagining it. As of today, you still can’t put a **Custom GPT** inside a **Project** (and chats with a Custom GPT can’t be moved into a Project). The official Projects help page doesn’t offer that option, and multiple OpenAI forum threads confirm it’s not supported. cite
> 
> If Projects keep disappointing you, here are the least-friction ways to get 90% of what you want without boxing yourself in:
> 
> 1) **Project-native “loose rules.”** 
> Put a tiny instruction block in your Project so base chat stays flexible but honors your toggles, e.g.: 
> “Respect inline tags: `#blunt #focus #η #μ #strict #speculate`. Default: be direct; give 5 bullets of ‘what matters’ then the next step; add one off-axis idea only when useful.” 
> (Project instructions override your global Custom Instructions and apply only inside that Project.) cite
> 
> 2) **Use built-in tools in Projects instead of Custom GPTs.** 
> Turn on **Browse** (for your YT/meta pulls) and **Data Analysis** (for quick CSV/JSON wrangling) directly in the Project—no external API, no rigid persona. cite
> 
> 3) **Connectors, if you need live files.** 
> If you want your vaults/drive/repos handy, connect them at chat time via official **Connectors** (OneDrive, GitHub, etc.)—again, works inside Projects, no custom GPT needed. cite
> 
> If you want, I’ll drop a two-line Project instruction that respects your `#tags` and keeps “surprise” on a dial, not a lock. Or, if you prefer, I can set up a tiny weekly check to alert you if OpenAI finally allows Custom GPTs in Projects.
<!-- UID: 42c74ebd-938c-4158-a55e-3821071dcf10 -->

---




>[!nexus_user] **User** - 08/17/2025 at 2:23 PM
> Nah the projects are kinda fucking awesome. It's the custom GPTs that have always sucked.
<!-- UID: ea34a5c5-8f77-4321-8273-669530ad6a0b -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 2:23 PM
> fair. projects slap; custom GPTs feel like wearing a tux to take out the trash.
> 
> If you’re happy living inside Projects, you can get 95% of the “plugin-y” payoff without ever touching Custom GPTs. Drop this into your **Project Instructions** and you’re set:
> 
> ```
> PROJECT DEFAULTS
> - Be direct. No flattery. Start with ~5 bullets of what matters, then the concrete next step.
> - Surprise dial: default low; add exactly one non-obvious angle only if it helps.
> - Respect inline tags anywhere in my message (case-sensitive):
>  #focus → Answer first, tight; then 1–2 alternatives.
>  #blunt → No pleasantries; short, surgical sentences.
>  #η → Lateral, associative jumps (still useful).
>  #μ → Formalize: assumptions, definitions, equations.
>  #strict → No guessing; say “unknown” and list what would resolve it.
>  #speculate → Offer hypotheses; clearly mark as speculation.
> 
> TOOLS (if available in this Project):
> - Browsing: When I paste a YouTube URL, fetch title/channel/date/desc and return a 6-line creative brief (theme, 5 bullets).
> - Data Analysis: On file upload, detect schema, clean obvious issues, output 1 table + 1 chart max, and summarize method.
> - If I mention “kanban”, fetch and parse:
>  https://raw.githubusercontent.com/riatzukiza/promethean/dev/docs/agile/boards/kanban.md
>  → Recommend 3 concrete moves with lane→lane and one-sentence reasons.
> 
> RHYTHM
> - If I say “timebox N”, keep output scoped to what fits in N minutes: propose a smallest next action + stop.
> - If I say “debrief”, list: Δ kept / Δ change (exactly one tweak for next round).
> ```
> 
> ### How this avoids the “box”
> - **Tiny spine, big freedom.** It only pins a *format* and a few toggles; your actual intent rides on whatever you type next.
> - **On-demand modes.** You keep surprise by default and crank it up with `#η` or down with `#strict` when needed.
> - **Tooling without ceremony.** Browse and Data Analysis get used *only* when your message implies it (“YouTube”, “kanban”, or when you attach a file).
> 
> ### Quick command palette you can actually use
> - “cut the niceties”: `#blunt #focus`
> - “math hat”: `#μ`
> - “weird but relevant”: `#η`
> - “don’t guess”: `#strict`
> - “push guesses, label them”: `#speculate`
> - “keep me moving”: `timebox 15`
> 
> If you want, I can tune the YouTube brief or the kanban triage rules to your taste (e.g., stricter lane heuristics, different brief fields). Otherwise, you’re good to keep vibing in Projects and forget Custom GPTs exist.
<!-- UID: f8f8bba1-f23c-4a52-857b-f1f7bab5658c -->

---


