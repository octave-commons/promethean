> Based on chat log `docs/chats/2025-08-03_03-57-36_ChatGPT_Promethean - Voice logic split analysis....md`.

## User
These bots split the voice logic from the Discord bot and removed the old path before testing latency. I'm unsure if it's useful.

## ChatGPT
- Splitting voice handling may aim for separation of concerns, modularity, or testability, but Node's async design already handles much of this.
- Without the original implementation there's no baseline for latency comparisons; reverting or running both versions is advised.
- Options: roll back, keep both via configuration, or fully define boundaries with a `VoiceService` class and dependency injection.

#tags: #voice #discord #architecture #promethean
