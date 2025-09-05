---
uuid: 636f49b1-4bf4-4578-8153-f1f34c250b05
created_at: obsidian-chatgpt-plugin-integration.md
filename: Obsidian ChatGPT Plugin Integration
title: Obsidian ChatGPT Plugin Integration
description: >-
  Explains how to use Obsidian's ChatGPT plugin for direct interaction with
  ChatGPT within notes, including markdown input, response formatting, and
  linking to other notes.
tags:
  - Obsidian
  - ChatGPT
  - Markdown
  - Plugin
  - Integration
  - Reference
  - Links
---
<hr class="__chatgpt_plugin">

### role::user

How does this work exactly? ^ref-ca8e1399-5-0



<hr class="__chatgpt_plugin">

### role::assistant<span style="font-size: small;"> (llama3.2:latest)</span>

Obsidian's ChatGPT MD plugin is a powerful tool that allows you to interact with me directly within your notes. Here's how it works: ^ref-ca8e1399-13-0

1. **You write in Markdown**: You type away in Obsidian, using Markdown syntax to format your text. ^ref-ca8e1399-15-0
2. **I receive the input**: When you're ready, I'll be notified and can respond to your question or provide guidance. ^ref-ca8e1399-16-0
3. **My responses are inserted as Markdown**: I'll provide my response, which will be formatted as Markdown, so it integrates seamlessly with your existing notes. ^ref-ca8e1399-17-0
4. **Linking and referencing**: If we need to reference other notes in your vault, I can use standard [[wiki links]] syntax or inline code (`[link]`) to make it easy for you to click through and explore related content. ^ref-ca8e1399-18-0

Ready to get started? What's on your mind? ^ref-ca8e1399-20-0

<hr class="__chatgpt_plugin">

### role::user

Yea maybe? ^ref-ca8e1399-26-0

<hr class="__chatgpt_plugin">

<% tp.obsidian.runCommand("chatgpt-md:call-chatgpt-api") %>
