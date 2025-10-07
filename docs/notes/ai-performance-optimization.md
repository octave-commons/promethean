---
$$
uuid: db4dcf59-fc3e-4a99-936f-281499af0eb7
$$
$$
created_at: '2025-09-03T22:36:42Z'
$$
filename: AI Performance Optimization
title: AI Performance Optimization
$$
description: >-
$$
  This document outlines key improvements for enhancing AI performance,
  including parallelizing Ollama batching, implementing a configurable function
  memoizer, and optimizing local AI prompts. It also covers setting up a kitchen
  sink compose file with vLLM and OpenVINO for efficient model serving.
tags:
  - AI
  - Optimization
  - Parallelization
  - BatchProcessing
  - Memoizer
  - PromptEngineering
  - vLLM
  - OpenVINO
$$
related_to_uuid:
$$
  - c953338c-d636-492a-84df-07ad9f5ca4c8
  - 7a83075b-6b0e-4064-b97e-2606b0d8a35a
  - 46b3c583-a4e2-4ecc-90de-6fd104da23db
$$
related_to_title:
$$
  - Optimizing AI Processing Pipeline
  - Document Processing Improvements
  - Promethean Event Bus MVP
references:
  - uuid: 7a83075b-6b0e-4064-b97e-2606b0d8a35a
    line: 21
    col: 0
    score: 1
  - uuid: 7a83075b-6b0e-4064-b97e-2606b0d8a35a
    line: 12
    col: 0
    score: 0.93
  - uuid: 7a83075b-6b0e-4064-b97e-2606b0d8a35a
    line: 3
    col: 0
    score: 0.89
  - uuid: 7a83075b-6b0e-4064-b97e-2606b0d8a35a
    line: 8
    col: 0
    score: 0.88
  - uuid: 7a83075b-6b0e-4064-b97e-2606b0d8a35a
    line: 16
    col: 0
    score: 0.88
---
# Todo

- Move Level Cache into Persistence:

- Better Parallelize Ollama Batching: ^ref-46e6b485-5-0
  - We currently wait for a batch to start processing, and then wait for it to finish before preprocessing the next batch.
  - This causes idle GPU time and idle CPU time.
- Function Memoizer with Configurable Drivers: ^ref-46e6b485-10-0

- Better Prompts for Local AI: ^ref-46e6b485-12-0

- Additional Improvements:

- Set up kitchen sink compose file
  - Has vLLM for optimized batched LLM queries
  - Has OpenVINO GenAI model server (NPU)

[[vLLM]] [[OpenVINO]]

#AI #Optimization #Parallelization #BatchProcessing #Memoizer #PromptEngineering
er with Configurable Drivers:

- Better Prompts for Local AI:

- Additional Improvements:

- Set up kitchen sink compose file
  - Has vLLM for optimized batched LLM queries
  - Has OpenVINO GenAI model server (NPU)

[[vLLM]] [[OpenVINO]]

#AI #Optimization #Parallelization #BatchProcessing #Memoizer #PromptEngineering
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Optimizing AI Processing Pipeline](2025.09.03.22.36.42.md)
- [Document Processing Improvements](2025.09.03.21.55.59.md)
- [Promethean Event Bus MVP]$promethean-event-bus-mvp-v0-1.md$
## Sources
- [Document Processing Improvements — L21]$2025.09.03.21.55.59.md#^ref-7a83075b-21-0$ (line 21, col 0, score 1)
- [Document Processing Improvements — L12]$2025.09.03.21.55.59.md#^ref-7a83075b-12-0$ (line 12, col 0, score 0.93)
- [Document Processing Improvements — L3]$2025.09.03.21.55.59.md#^ref-7a83075b-3-0$ (line 3, col 0, score 0.89)
- [Document Processing Improvements — L8]$2025.09.03.21.55.59.md#^ref-7a83075b-8-0$ (line 8, col 0, score 0.88)
- [Document Processing Improvements — L16]$2025.09.03.21.55.59.md#^ref-7a83075b-16-0$ (line 16, col 0, score 0.88)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
