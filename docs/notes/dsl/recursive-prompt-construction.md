A reflective system for building prompts: each LLM call generates output that is mined for new fragments, which are then assembled into the next prompt. Fragments are stored in `PromptMemory` and retrieved via tags or embeddings. Macros like `deffragment`, `defprompt`, and `reflect` enable recursive improvement cycles.

Related notes: $[prompt-compiler-dsl]$, $[runtime-and-prompt-macro-dsl]$ $[../../unique/index|unique/index]$

#tags: #prompt #llm #reflection
