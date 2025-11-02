> Based on chat log `docs/chats/2025-08-03_03-58-19_ChatGPT_Promethean - Vision models and multiple images....md`.

## User
Can vision models handle multiple images? Ollama's API accepts an array but doesn't show examples.

## ChatGPT
- Many multimodal models process multiple images by encoding each through a vision encoder and feeding embeddings sequentially into the LLM.
- Support depends on training; models not fine-tuned for multi-image reasoning may ignore all but the first image or exceed context limits.
- Ollama's API accepts multiple images, but behavior varies by model; testing is required to confirm reasoning across images.
- The broader goal is building a system where accumulating cognition and embodied feedback create a sense of presence.

#tags: #vision #multimodal #ollama #promethean
