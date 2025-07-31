A reflective system for building prompts: each LLM call generates output that is mined for new fragments, which are then assembled into the next prompt. Fragments are stored in `PromptMemory` and retrieved via tags or embeddings. Macros like `deffragment`, `defprompt`, and `reflect` enable recursive improvement cycles.

Related notes: [prompt-compiler-dsl](prompt-compiler-dsl.md), [runtime-and-prompt-macro-dsl](runtime-and-prompt-macro-dsl.md) [unique/index](../../unique/index.md)

#tags: #prompt #llm #reflection
