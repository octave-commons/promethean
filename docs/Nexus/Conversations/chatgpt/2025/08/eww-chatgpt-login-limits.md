---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "eww chatgpt login limits"
conversation_id: 68aa0a48-5644-8321-bd8a-38363bd020fc
create_time: 08/23/2025 at 1:36 PM
update_time: 08/23/2025 at 1:41 PM
---

# Title: eww chatgpt login limits

Created: 08/23/2025 at 1:36 PM
Last Updated: 08/23/2025 at 1:41 PM
Chat URL: https://chat.openai.com/c/68aa0a48-5644-8321-bd8a-38363bd020fc


>[!nexus_user] **User** - 08/23/2025 at 1:36 PM
> So... I have a crazy idea... I want to use eww to interact with the chatgpt website, but I don't know if I can login with this.
<!-- UID: 2b16617c-7d59-4306-a194-22665c41ddc1 -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 1:36 PM
> That’s not too crazy actually — people have used **eww (Emacs Web Wowser)** for all sorts of web logins. The snag is that ChatGPT’s site relies heavily on **JavaScript and complex authentication flows (OAuth via Auth0, cookies, CSRF tokens, etc.)**. 
> 
> Some constraints you’ll run into:
> 
> - **eww doesn’t support JavaScript.** This is the biggest blocker. The login process for ChatGPT requires JS for rendering the login form, handling redirects, and exchanging tokens.
> - Even if you could load the login form HTML, the auth flow won’t complete without JS to call the API endpoints in the right sequence.
> - Once logged in, ChatGPT’s frontend is React-based, so eww wouldn’t render or allow interaction.
> 
> But, you *can* cheat a bit:
> 
> 1. **Use API tokens instead of the website** 
>  - If your goal is to interact with ChatGPT from Emacs, the more realistic route is calling the OpenAI API (with your API key stored in your config or a `.authinfo.gpg` file).
>  - There are packages like [`gptel`](https://github.com/karthink/gptel), [`chatgpt-shell`](https://github.com/xenodium/chatgpt-shell), or even writing a thin wrapper around `url-retrieve`.
> 
> 2. **Headless browser login, then feed eww the cookies** 
>  - Use a headless browser like `chromium --headless --remote-debugging-port=...` or Puppeteer/Playwright to log in and extract the `__Secure-next-auth.session-token` cookie.
>  - Inject that cookie into eww’s session so that requests appear authenticated. This lets you fetch *some* pages, but they still won’t render right because of the JS requirement.
> 
> 3. **Local bridge** 
>  - Run a background Node.js/Python service that uses your logged-in browser session (via Puppeteer, Playwright, or Selenium). 
>  - Talk to it from Emacs via `request.el` or `websocket.el`. 
>  - That way eww or an Emacs buffer can “feel” like it’s interacting with the website, but really you’re proxied through a full browser.
> 
> So, bottom line: **direct login in eww won’t work** (no JS). But you can totally make Emacs your ChatGPT client — just not through eww alone. 
> 
> 👉 Question for you: are you imagining this as a **purely fun hack (browse chatgpt.com in eww)**, or more like a **serious workflow (chat with GPT from inside Emacs)**? I can show you how to wire it up either way.
<!-- UID: 9a1adc90-6ee4-4ba2-ad8f-71c02183473d -->

---




>[!nexus_user] **User** - 08/23/2025 at 1:38 PM
> if I use an api key, I have to pay based on token usage?
<!-- UID: 07f6de48-8b6c-44b0-888b-bc76cdbef888 -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 1:38 PM
> Exactly, yeah — if you go the **API key route**, you’re billed per token used (input + output). 
> 
> - **ChatGPT website / app** (what you’re using right now with Plus): flat monthly subscription, no metering that you see. 
> - **OpenAI API with an API key**: pure pay-per-use, and the bill depends on the model and number of tokens. For example:
>  - GPT-4o: around $2.50 per million input tokens and $10 per million output tokens. 
>  - GPT-4o-mini: much cheaper, around $0.15 input / $0.60 output per million. 
> 
> So if you wire up Emacs to the API directly, you bypass the subscription UX, but you get a metered bill. If you stick to the web interface (through a browser or a proxy service), you stay on the flat subscription but you can’t really integrate cleanly into Emacs. 
> 
> There is a third hacky option some people do: **reuse the web session token** (like the `__Secure-next-auth.session-token` cookie). That way you can make requests that look like they come from the website, but OpenAI hasn’t published a stable API for that, so it’s brittle and may break often. 
> 
> Do you want me to map out what it would look like if you tried to keep using your **Plus subscription** inside Emacs (by hijacking session cookies), vs what it would look like to just go API-key route?
<!-- UID: 49da3dd8-a448-4ea7-a914-e773527ccc3c -->

---




>[!nexus_user] **User** - 08/23/2025 at 1:38 PM
> I have... no idea how many tokens I've used in the chats we have had...
<!-- UID: 5158bf12-16bb-4bb4-aef6-0e8af461949c -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 1:38 PM
> That’s the catch — in the **ChatGPT website/app** you never see a token meter, so it feels “free” once you pay the flat Plus fee. 
> 
> But under the hood, everything you and I have said back and forth **does get tokenized**. A “token” is roughly 4 characters of English text on average (so 75 words ≈ 100 tokens). Both **your messages** and **my responses** count toward the total. 
> 
> If you were using the **API**, every single request would show up on your bill. A few ballpark numbers: 
> 
> - **Short Q&A (like this one):** ~200–400 tokens round trip. 
> - **Long back-and-forth (multi-paragraph answers):** easily 1k–2k tokens per turn. 
> - **Big dumps (like code files, essays, transcripts):** can shoot up into the tens of thousands of tokens fast. 
> 
> So if you look at our chats here — where you often paste big hunks of code, specs, or conceptual notes — some of those exchanges would be several thousand tokens each. On API pricing, you’d *feel* it. 
> 
> 👉 If you want, I can take a sample of one of our long conversations, tokenize it like the API would, and give you an estimate of how many tokens (and how much $$) it would have been. Want me to do that?
<!-- UID: bb8e76cd-58d3-4de8-a3a1-ad24210993be -->

---




>[!nexus_user] **User** - 08/23/2025 at 1:39 PM
> sure
<!-- UID: f503546f-5ef0-40d6-bf8f-9059dfc0c318 -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 1:39 PM
> Short answer: yeah—on the API you pay per token (input + output). The exact $ depends on the model. Current posted prices (per 1M tokens): **GPT‑4o: $5 input / $20 output**, **GPT‑4o‑mini: $0.60 input / $2.40 output**. cite
> 
> Here’s what a few “typical” sessions would have cost on the API:
> 
> - **Light chat** (~3,000 input + 1,500 output tokens) 
>  - GPT‑4o ≈ **$0.045** (0.003M×$5 + 0.0015M×$20) 
>  - 4o‑mini ≈ **$0.0054** (0.003M×$0.60 + 0.0015M×$2.40)
> 
> - **Code review** (~15,000 input + 5,000 output) 
>  - GPT‑4o ≈ **$0.175** 
>  - 4o‑mini ≈ **$0.021**
> 
> - **Heavy session** (~60,000 input + 20,000 output) 
>  - GPT‑4o ≈ **$0.70** 
>  - 4o‑mini ≈ **$0.084**
> 
> If you want a **precise estimate for one of our long threads**, paste any chunk of it here and tell me roughly how long my replies were (or paste those too). I’ll tally tokens and give you an exact cost using the current pricing. (I can also show the math step‑by‑step if you like.)
<!-- UID: 674deebd-07e3-4048-a322-2c3cca0accab -->

---




>[!nexus_user] **User** - 08/23/2025 at 1:40 PM
> and... what bout gpt5?
<!-- UID: e2f33a9e-319c-4a5c-94df-947a99c791f2 -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 1:40 PM
> You got it! Here's the straight scoop on **GPT-5**—what it is, how you can access it, and how the API pricing stacks up.
> 
> ---
> 
> ## What Is GPT-5?
> 
> - **Launch date**: August 7, 2025; it’s OpenAI’s new flagship model, replacing GPT-4, GPT-4o, GPT-4.5, and others citeturn0news22turn0news26turn0news23.
> - It’s a **unified, multimodal model**—it intelligently routes between “fast” and “deep-thinking” sub-models based on the task’s complexity citeturn0news26turn0news23.
> - Available to **all ChatGPT users** (free, Plus, Pro), with Pro users unlocking higher usage limits and “Pro” tier capabilities citeturn0news22turn0news23turn0news26.
> 
> ---
> 
> ## GPT-5 API Pricing (per 1 million tokens)
> 
> Here’s the breakdown for developers using the OpenAI API:
> 
> | Model Variant | Input Cost | Output Cost | Cached Input Cost |
> |-----------------------|---------------|------------------|-------------------|
> | **GPT-5 (standard)** | $1.25 | $10.00 | $0.125 |
> | **GPT-5 mini** | $0.25 | $2.00 | $0.025 |
> | **GPT-5 nano** | $0.05 | $0.40 | $0.005 |
> 
> - The “cached input” cost applies to repeats of input recently used—OpenAI applies about a **90% discount** to reused inputs citeturn0news22.
> - GPT-5 is notably **much cheaper per token than GPT-4o**, especially on input costs cite.
> 
> ---
> 
> ## ChatGPT Subscriptions & GPT-5 Access
> 
> Here's how GPT-5 access lines up across ChatGPT plans:
> 
> - **Free users**: Access to GPT-5 and mini versions, but with **usage limits** citeturn0news22turn0news23.
> - **Plus ($20/month)**: Higher usage caps, access to “Thinking” modes, and features like file uploads and web browsing citeturn0news25turn0news26.
> - **Pro ($200/month)**: **Unlimited GPT-5 Pro**, deeper reasoning modes, early feature access, and integrations (e.g. Gmail, Google Calendar) citeturn0news9turn0news26turn0news23turn0news27.
> - In India, there's now a budget **ChatGPT Go** plan (~₹399/month or ~$5), which also includes access to GPT-5 (plus minibots and multimodal features) citeturn0news11turn0news14.
> 
> ---
> 
> ## TL;DR Summary
> 
> - **Released**: August 7, 2025, GPT-5 replaces older GPT models; free and paid users now use it by default citeturn0news22turn0news23turn0news26.
> - **API Pricing** (per million tokens): 
>  - GPT-5: $1.25 input / $10 output (cached input: $0.125) 
>  - Mini: $0.25 / $2 (cached: $0.025) 
>  - Nano: $0.05 / $0.40 (cached: $0.005) citeturn0news22turn0news23turn0news26.
> - **ChatGPT Plans**: 
>  - Free → capped access 
>  - Plus → more usage, “Thinking” modes 
>  - Pro → unlimited “Pro” reasoning access & tool integrations 
>  - India-specific “Go” plan provides lower-cost access and GPT-5 features citeturn0news11turn0news14turn0news25turn0news26.
> 
> ---
> 
> ### What Next?
> 
> Want to estimate how much a session would cost using GPT-5 on the API, or help figure out which variant fits your use case best? Just say the word—I can break it down, token by token.
> 
> Also, if you're considering using ChatGPT inside Emacs (via the API), GPT-5's much cheaper token prices mean you’d get more value for your money compared to older models.
> 
> Let me know what you're aiming for—casual chat, code deep dives, or lightweight summaries—and I can recommend the most cost-effective option!
> 
> navlistFurther readingturn0news22,turn0news26,turn0news9
<!-- UID: 432003b3-95e7-44e5-81b1-2b63913884c5 -->

---


