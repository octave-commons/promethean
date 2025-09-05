---
uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
created_at: obsidian-templating-plugins-integration-guide.md
filename: obsidian-templating-plugins-integration-guide
title: obsidian-templating-plugins-integration-guide
description: >-
  Guide on integrating various Obsidian templating plugins to create cohesive
  templates for tasks and notes, focusing on Kanban board integration and
  dynamic placeholder usage.
tags:
  - obsidian
  - templating
  - kanban
  - plugins
  - placeholders
  - integration
  - templates
  - workflow
---
<hr class="__chatgpt_plugin">

### role::user

How does this work exactly? ^ref-b39dc9d4-5-0



<hr class="__chatgpt_plugin">

### role::assistant<span style="font-size: small;"> (llama3.2:latest)</span>

Obsidian's ChatGPT MD plugin is a powerful tool that allows you to interact with me directly within your notes. Here's how it works: ^ref-b39dc9d4-13-0

1. **You write in Markdown**: You type away in Obsidian, using Markdown syntax to format your text. ^ref-b39dc9d4-15-0
2. **I receive the input**: When you're ready, I'll be notified and can respond to your question or provide guidance. ^ref-b39dc9d4-16-0
3. **My responses are inserted as Markdown**: I'll provide my response, which will be formatted as Markdown, so it integrates seamlessly with your existing notes. ^ref-b39dc9d4-17-0
4. **Linking and referencing**: If we need to reference other notes in your vault, I can use standard [[wiki links]] syntax or inline code (`[link]`) to make it easy for you to click through and explore related content. ^ref-b39dc9d4-18-0

Ready to get started? What's on your mind? ^ref-b39dc9d4-20-0

<hr class="__chatgpt_plugin">

### role::user

Yea maybe? ^ref-b39dc9d4-26-0


<% tp.obsidian.runCommand("chatgpt-md:call-chatgpt-api") %> ^ref-b39dc9d4-29-0


<hr class="__chatgpt_plugin">

### role::assistant<span style="font-size: small;"> (llama3.2:latest)</span>

I've been called in! ^ref-b39dc9d4-36-0

Now that I'm connected, feel free to ask me anything. You can type away as you normally would, and I'll respond with Markdown-formatted guidance. ^ref-b39dc9d4-38-0

If you need a quick test, I can start by suggesting how to organize your thoughts or structure your notes. What topic are you working on, or do you have a specific question in mind? ^ref-b39dc9d4-40-0

<hr class="__chatgpt_plugin">

### role::user

yea I'm trying to figure out how to make these various templating plugins play nice with each other... with how many different concepts of a "template" there are, it is been a bit of a head scratcher.

I want to be able to create a new note on my kanban board that uses the title of that note and a basic structure of a task to generate a reasonable starting point for that task.



<hr class="__chatgpt_plugin">

### role::assistant<span style="font-size: small;"> (llama3.2:latest)</span>

Templating plugins can indeed be overwhelming with all the different concepts and syntaxes out there.

To tackle your specific use case, it sounds like you want to create a template that generates a new note based on the title of an existing note and a basic structure for a task. Here's a suggested approach: ^ref-b39dc9d4-58-0

1. **Use the `template` command**: You can use the `template` command in Obsidian to create a new template. This will allow you to define a basic structure for your notes. ^ref-b39dc9d4-60-0
2. **Define a template with placeholders**: Create a template that includes placeholders for the task title, description, and any other relevant information. For example: ^ref-b39dc9d4-61-0
```markdown
# {{title}}
- Description: {{description}}
```
^ref-b39dc9d4-62-0 ^ref-b39dc9d4-66-0
This template has two placeholders: `{{title}}` and `{{description}}`. You can use these placeholders to dynamically fill in the actual values.
3. **Use a plugin like `Template Builder` or `Quick Templates`**: These plugins can help you create complex templates with multiple placeholders, conditions, and actions. They might also offer features like auto-completion and suggestions for your template fields.
4. **Integrate with Kanban board plugin**: To generate a new note on your kanban board based on the title of an existing note, you'll need to use a plugin like `Kanban Board` or `Board View`. You can then use a script or a template to create a new note with the desired structure.
 ^ref-b39dc9d4-70-0
To take it a step further, you could explore using plugins like `Script` or `Macro` to automate this process. These plugins allow you to write custom scripts that interact with Obsidian's API and execute specific actions.
 ^ref-b39dc9d4-72-0
Here's an example of how you could use the `template` command to create a new template: ^ref-b39dc9d4-73-0
```markdown
tp.template create "Task Template"
^ref-b39dc9d4-73-0
```
This will open the template editor, where you can define your placeholders and structure. You can then save the template and use it in your kanban board plugin.

How does this sound? Is there a specific plugin or approach you'd like to explore further?

<hr class="__chatgpt_plugin">

### role::user
