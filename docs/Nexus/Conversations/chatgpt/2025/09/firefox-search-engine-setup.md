---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Firefox search engine setup"
conversation_id: 68b6fd98-b8fc-832e-ae7d-00984ec9d68e
create_time: 09/02/2025 at 9:22 AM
update_time: 09/02/2025 at 12:28 PM
---

# Title: Firefox search engine setup

Created: 09/02/2025 at 9:22 AM
Last Updated: 09/02/2025 at 12:28 PM
Chat URL: https://chat.openai.com/c/68b6fd98-b8fc-832e-ae7d-00984ec9d68e


>[!nexus_user] **User** - 09/02/2025 at 9:22 AM
> firefox edit search engine advanced setting suggestions URL with %s in place of search term (optional)
<!-- UID: adc0fe97-5536-42b1-b436-95f17118500b -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:24 AM
> # Firefox — “Suggestions URL” for custom search engines (with `%s`)
> 
> Short version: Firefox’s **Add search engine → Advanced settings → Suggestions URL** expects an endpoint that returns **OpenSearch-style suggestions JSON**, and you put `%s` where the query goes. Examples below.
> 
> ## Where to add it
> 1. `about:preferences#search` → **Search Shortcuts** → **Add…** 
> 2. Fill **Search URL** (e.g., `https://example.com/search?q=%s`). 
> 3. Expand **Advanced settings** → **Suggestions URL** and paste a working endpoint with `%s`. Firefox accepts JSON from endpoints that follow OpenSearch’s `application/x-suggestions+json` (or plain `application/json`) format. citeturn6view0
> 
> > If you don’t see the **Add…** button in Search Shortcuts on some builds, Mozilla’s doc mentions a pref involved with the alias refresh feature. citeturn2view0
> 
> ## Good, known-working suggestion endpoints
> 
> - **Google (general)** 
>  `https://suggestqueries.google.com/complete/search?client=firefox&q=%s` 
>  Returns the classic `[ "query", [ "s1", "s2", ... ] ]` JSON. (Undocumented but widely used.) cite
> 
> - **YouTube (via Google suggest)** 
>  `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=%s` 
>  `ds=yt` narrows suggestions to YouTube. cite
> 
> - **DuckDuckGo** 
>  `https://ac.duckduckgo.com/ac/?q=%s` 
>  Returns JSON list items; works fine as a Suggestions URL. cite
> 
> - **Wikipedia (English)** 
>  `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=%s&limit=10` 
>  MediaWiki documents the OpenSearch endpoint. cite
> 
> - **Startpage** 
>  `https://www.startpage.com/osuggestions?q=%s` 
>  Startpage’s help explicitly lists this for browser suggestions. cite
> 
> > These match Firefox’s OpenSearch/suggestions expectations. MDN confirms Firefox accepts a `Url` of type `application/x-suggestions+json` (alias `application/json`) for suggestions. citeturn6view0
> 
> ## How to find a Suggestions URL for any site (fast)
> 1. Open the site, start typing in its own search box. 
> 2. DevTools → **Network** tab → filter for `suggest`, `ac`, `complete`, `typeahead`, or `search`. 
> 3. Copy the request URL that returns JSON suggestions, and replace the query value with `%s`. 
> 4. Paste that into Firefox’s **Suggestions URL**. It should work if the endpoint:
>  - Is **GET** without auth headers/cookies, and 
>  - Returns JSON suggestions in a simple array format.
> 
> ## Gotchas
> - **Auth-required or header-only APIs won’t work** (Firefox’s field can’t add headers). For example, **Brave’s official Suggest API** requires an API key via `X-Subscription-Token`, so you can’t use that in Firefox’s Suggestions URL field. (Older undocumented endpoints may have worked, but Brave’s documented endpoint needs a token.) cite
> - Some “autocomplete” APIs (Amazon, Bing, etc.) exist but are **undocumented/fragile** and often change, rate-limit, or require extra params. YMMV. cite
> 
> ## Quick test
> Before saving, hit the Suggestions URL in a tab with `%s` replaced, e.g. `…q=firefox`. You should see JSON (often `["firefox", ["firefox addons", …]]`). MDN documents this OpenSearch suggestions style. citeturn6view0
> 
> If you want more site-specific Suggest URLs, say which engines and I’ll hand you tested strings.
> 
> #obsidian #firefox #customSearch #OpenSearch #suggestions #howto
<!-- UID: 23cc4863-7878-4444-83af-bd9eb3f0bbdc -->

---




>[!nexus_user] **User** - 09/02/2025 at 9:27 AM
> how about for chatgpt?
<!-- UID: 1b1a7ab1-14cb-4c6d-b4a1-e0ff6cdc3621 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:29 AM
> Yep—ChatGPT works as a Firefox custom engine for **Search URL**, but there’s **no public Suggestions URL** from OpenAI. Here’s the practical setup.
> 
> ## Search URL (works)
> Pick one of these for **URL with %s**:
> 
> - Basic new chat: 
>  `https://chatgpt.com/?q=%s` citeturn1view0
> - Force “Search” mode (aka SearchGPT): 
>  `https://chatgpt.com/?q=%s&hints=search` citeturn4view0
> - Keep history clean (temporary chats): 
>  `https://chatgpt.com/?q=%s&hints=search&temporary-chat=true` citeturn4view0
> - Pin a model (example): 
>  `…&model=gpt-4o` or `…&model=gpt-4o-mini` citeturn1view0turn4view0
> 
> Where to add it in Firefox: Settings → Search → **Search Shortcuts** → **Add** → paste one of the above (Firefox expects `%s` as the placeholder). citeturn7view0
> 
> ## Suggestions URL (does **not** exist for ChatGPT)
> Firefox suggestion endpoints must return OpenSearch-style JSON (`application/x-suggestions+json`)—ChatGPT doesn’t publish one (no OpenSearch description file; `opensearch.xml` isn’t provided). So you can’t get native, type-as-you-go ChatGPT suggestions. citeturn5view0
> 
> ### Workable hacks
> - Use a **different** provider just for suggestions (Firefox allows that), e.g. DuckDuckGo: 
>  **Suggestions URL:** `https://ac.duckduckgo.com/ac/?q=%s` 
>  You’ll see DDG suggestions while typing, but pressing Enter still sends the query to ChatGPT via your Search URL. (This matches Firefox’s OpenSearch expectations.) cite
> - Or host your own tiny endpoint that emits the OpenSearch suggestion array (useful if you want “prompt presets” to appear as suggestions). Mozilla documents the exact format. cite
> 
> ## Quick sanity check
> Open a new tab and hit `https://chatgpt.com/?q=hello&hints=search&temporary-chat=true`—it should start a chat/search with that query. If you want to be picky about models, add `&model=gpt-4o` at the end. citeturn1view0turn4view0
> 
> #firefox #chatgpt #customSearch #OpenSearch #suggestions
<!-- UID: cea0faad-53c4-467d-a812-998e17391877 -->

---




>[!nexus_user] **User** - 09/02/2025 at 9:31 AM
> ok, how about perplexity.ai, does it offer opensearch style json?
<!-- UID: 7bf9efa9-1706-4ba0-8dd4-02f8fe31eaf5 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:32 AM
> Short answer: **Yes for OpenSearch; no (public) for suggestions JSON.**
> 
> ## What works
> - **OpenSearch descriptor exists** at `https://www.perplexity.ai/opensearch.xml`, which lets Firefox detect/add Perplexity as a search engine. cite
> - **Search URL** you can paste manually: 
>  `https://www.perplexity.ai/search?q=%s` (or `https://www.perplexity.ai/?q=%s`). Community how-tos confirm these work in Firefox. cite
> 
> ## What doesn’t (right now)
> - **No documented OpenSearch suggestions endpoint** (`application/x-suggestions+json`) from Perplexity. There’s no official doc, and users report no native autocomplete when set as default. Translation: Firefox’s **Suggestions URL** box can’t be filled with a Perplexity endpoint today. cite
> 
> ## Practical workaround (so you still get type-ahead)
> Use another provider just for suggestions; Enter stays routed to Perplexity.
> 
> - **DuckDuckGo suggestions URL:** 
>  `https://ac.duckduckgo.com/ac/?q=%s` (JSON suggestions). cite
> - **Wikipedia suggestions URL (OpenSearch format):** 
>  `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=%s` cite
> 
> That’s the clean setup: Perplexity for the **Search URL**, DDG/Wikipedia for **Suggestions URL**.
> 
> #obsidian #firefox #perplexity #OpenSearch #suggestions #howto
<!-- UID: acb93045-4b49-4f15-9588-c508630bcae4 -->

---


