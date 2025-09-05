---
uuid: 240e7303-7aab-4325-bae3-83c5a09fe406
created_at: duckduckgosearchpipeline.md
filename: DuckDuckGo Search Pipeline
title: DuckDuckGo Search Pipeline
description: >-
  A search pipeline that uses passive data retrieval to generate search terms
  and augment context through a state object, avoiding active tool calls. It
  operates in phases to determine the LLM's goal and search interests, enabling
  efficient context augmentation without direct tool interactions.
tags:
  - search pipeline
  - passive data retrieval
  - state object
  - LLM augmentation
  - DuckDuckGo
  - context augmentation
  - phases
  - state management
---
When I was doing duck way back but not so far back, when I was using ollama and doing chroma searches and all that.
There was a search daemon constantly generating search terms based off of the current context
There was a state object
on that state object, the LLM could put whatever it wanted to.
And we had several phases in the pipeline, like asking it what it thought it's goal was, what search terms was it interested in, etc
instead of active tool calls, we were doing passive data retrieval, and augmenting context with all of it.
it worked surprisingly well
