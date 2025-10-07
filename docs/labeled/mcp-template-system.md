---
uuid: b108ee22-375b-4f48-8345-b567dbdb8e97
created_at: '2025-10-02T16:48:54Z'
title: 2025.10.02.16.48.54
filename: MCP Template System
description: >-
  A new MCP tool package that enables asynchronous task delegation to Ollama,
  using S-expression templates for complex text generation workflows. It
  supports template definition, job enqueueing, conversation management, and
  real-time queue monitoring with Ollama integration.
tags:
  - async
  - ollama
  - templates
  - s-expressions
  - workflow
  - job-queue
  - conversational
  - mcp
related_to_uuid: []
related_to_title: []
references: []
---
Add a new MCP tool too packages/mcp that allow for the asyncronous delegation of tasks to ollama, which them selves are able to use the MCP tools provided by the mcp package, including to create new ollama jobs.
templates are s-expressions which include which allow for complex generation of text using a combination of allowed functions, variable insertion, and calls to other templates along with simple flow logic.
A template might look like:
```lisp
(define-template template-name [a b c ...args]
(if a (do "This is something that might happen" )
b ()
)
)
```
It should allow you to:
- pull(modelName:string)
- listModels()
- listTemplates()
- enqueueGenerateJob(jobName?:string,modelName:string, prompt:string, suffix:string,options:OllamaOptions) -> {jobName, id, queuePosition}
- enqueueChatCompletion(jobName?:string,modelName:string, messages:OllamaMessage[]|conversatinId|conversationName, options:OllamaOptions) -> {jobName, id, queuePosition}
- enqueueJobFromTemplate(jobName?, templateName, )
- startConversation(conversationName?, initialMessage:string, systemPrompt?:string) -> {conversationId, conversationName, jobId}
- getQueue() -> {pending:Job[], inProgress:Job[], completed:Job[]}
- removeJob(jobName|jobid)
- createTemplate(templateName,)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
