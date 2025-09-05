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
related_to_uuid:
  - 3724ef1e-d13f-4b52-8045-ba149d90fdec
  - 3bea339f-aea3-4dae-8e1c-c7638a6899b0
  - e38b1810-e331-4fff-9f87-8f93a2d5d179
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 63268470-ed9f-48c5-98da-f158c15ec8f5
related_to_title:
  - obsidian-templating-plugins-integration-guide
  - Obsidian ChatGPT Plugin Integration Guide
  - Plan Update Confirmation
  - Universal Lisp Interface
  - Duck's Attractor States
references:
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 13
    col: 0
    score: 1
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 13
    col: 0
    score: 1
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 18
    col: 0
    score: 1
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 18
    col: 0
    score: 1
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 15
    col: 0
    score: 0.99
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 15
    col: 0
    score: 0.99
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 17
    col: 0
    score: 0.99
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 17
    col: 0
    score: 0.99
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 16
    col: 0
    score: 0.98
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 29
    col: 0
    score: 0.98
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 16
    col: 0
    score: 0.97
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 20
    col: 0
    score: 0.92
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 20
    col: 0
    score: 0.92
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 5
    col: 0
    score: 0.91
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 5
    col: 0
    score: 0.89
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 26
    col: 0
    score: 0.89
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 26
    col: 0
    score: 0.89
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
