---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Exclude empty strings filter"
conversation_id: 68a25fcf-0004-8331-8d4a-ba5dfa3767a4
create_time: 08/17/2025 at 6:03 PM
update_time: 08/17/2025 at 6:04 PM
---

# Title: Exclude empty strings filter

Created: 08/17/2025 at 6:03 PM
Last Updated: 08/17/2025 at 6:04 PM
Chat URL: https://chat.openai.com/c/68a25fcf-0004-8331-8d4a-ba5dfa3767a4


>[!nexus_user] **User** - 08/17/2025 at 6:03 PM
> How do I change this to exclude empty strings?
> 		const messages = (await discordMessagesCollection
> 			.find({
> 				[`embedding_status.${EMBED_VERSION}`]: { $ne: 'done' },
> 				content: { $ne: null },
> 			})
> 			.limit(100)
> 			.toArray()) as Array<DiscordMessage & { content: string }>;
<!-- UID: 2827cc7c-486b-40eb-aa4d-679736872d3d -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 6:03 PM
> Right now your filter only excludes `null`, but not empty strings. 
> In MongoDB, to exclude both you can use `$nin` (not in):
> 
> ```ts
> const messages = (await discordMessagesCollection
>  .find({
>  [`embedding_status.${EMBED_VERSION}`]: { $ne: 'done' },
>  content: { $nin: [null, ""] }, // excludes null and empty string
>  })
>  .limit(100)
>  .toArray()) as Array<DiscordMessage & { content: string }>;
> ```
> 
> That way `content` must not be `null` **and** not an empty string. 
> 
> If you also want to exclude strings with only whitespace (e.g. `" "`), you’d need a regex:
> 
> ```ts
> content: { $nin: [null, ""], $not: /^\s*$/ },
> ```
> 
> Do you want to strictly filter out just `""` and `null`, or also whitespace-only messages?
<!-- UID: 5492c0cb-e536-4ae4-8753-1ca9d7948af8 -->

---


