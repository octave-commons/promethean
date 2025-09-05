---
uuid: 9a26150e-447f-45de-aa21-435b0d6b7066
created_at: obsidian-task-generation.md
filename: Obsidian Task Generation
title: Obsidian Task Generation
description: >-
  A prototype for generating new tasks using Obsidian's command features,
  highlighting undocumented functionality and integration challenges with
  plugins.
tags:
  - obsidian
  - task generation
  - undocumented features
  - plugin integration
  - command execution
---
So I've gotten something that is better than nothing working for generating new tasks... I don't really like it but... I hate that we have the "windows" problem here. ^ref-9b694a91-1-0
We have all this tooling *around* obsidian, but we don't have insights into key features of it.
The `executeCommand` and `executeCommandById` are both completely undocumented featues.

Right now the new task template works by callng the chatgpt md plugin after a sleep.

The fact that the smart context thing is not visible in the doucment it's self kinda sucks. ^ref-9b694a91-7-0
for trying to use it in conjunction with other plugins to generate documents..
