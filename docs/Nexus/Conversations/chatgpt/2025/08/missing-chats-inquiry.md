---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Missing chats inquiry"
conversation_id: 6899f710-f078-8321-8829-8b5654ab1124
create_time: 08/11/2025 at 8:58 AM
update_time: 08/12/2025 at 9:12 AM
---

# Title: Missing chats inquiry

Created: 08/11/2025 at 8:58 AM
Last Updated: 08/12/2025 at 9:12 AM
Chat URL: https://chat.openai.com/c/6899f710-f078-8321-8829-8b5654ab1124


>[!nexus_user] **User** - 08/11/2025 at 8:58 AM
> yo where'd my non project chats all go?
<!-- UID: d81280c4-ac16-41dc-aac5-ab064f001587 -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 8:58 AM
> If you mean in ChatGPT’s left-hand conversation list — OpenAI’s UI now tries to group and surface “recently active” threads first, and it’s really aggressive about hiding older or less-active ones. 
> Non-project chats you haven’t touched in a while can basically get buried unless you scroll way down or search for them. 
> 
> A couple other things that can make them seem to “vanish”: 
> 
> - **Filter/view change** — If you ever clicked into a project “workspace” or collection, the sidebar only shows conversations from that scope. You have to switch back to “All chats” at the top. 
> - **Search bar** — Typing in the search bar narrows the list; even one character filters it. If you left something in there, everything else disappears until you clear it. 
> - **New sorting** — Some accounts are testing sort by “Most recent reply” instead of “Most recent start,” so older ongoing chats can get pushed down. 
> - **Account or browser change** — Conversations are tied to the logged-in account. Different account, different set. 
> 
> If they’re still missing after scrolling and clearing filters, they’re not actually deleted unless you manually hit “Delete.” Sometimes it’s just a UI paging issue, and refreshing will pull them back. 
> 
> Do you want me to walk you through pulling up all your older chats so you can see if they’re just buried?
<!-- UID: ecf2fe04-01df-4c19-8b50-6c897214bd4c -->

---




>[!nexus_user] **User** - 08/11/2025 at 9:00 AM
> Yea I can see all the hidden ones when I search... but the search kinda sucks.
<!-- UID: 3c9971c4-afe3-4ae6-a68d-f829b2867ff0 -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 9:00 AM
> Yeah, the search is basically a bandaid over a bad sidebar design right now — it’s literal keyword matching on conversation titles (and maybe the first message), so if you didn’t name it something memorable, it’s almost useless. 
> 
> You’ve basically got three workarounds: 
> 
> 1. **Force chronological view** 
>  - Click the “All chats” or workspace dropdown at the top of the sidebar and make sure you’re not in a project view. 
>  - Then just scroll… a lot. There’s lazy-loading, so it will eventually pull them all in order. 
> 
> 2. **Rename key threads** 
>  - If there are certain non-project chats you want to keep handy, give them short, unique names so they’re easy to find. Even something like `!personal` will make them pop to the top of search. 
> 
> 3. **External index** (the nuclear option) 
>  - Copy the URLs of important chats into your own doc (you could even throw them into Obsidian and tag them). They don’t expire, so you can jump back without dealing with the sidebar. 
> 
> If you want, I can show you a quick hack to make the sidebar **always** show all chats instead of hiding older ones — but it involves a bit of browser console magic. Would you want me to go that route?
<!-- UID: 568d25b9-e122-4d6e-bd3a-650f288ba3bc -->

---


