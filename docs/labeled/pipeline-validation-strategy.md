---
uuid: c89761d3-2b1c-4607-a033-ab5d86936d0d
created_at: '2025-09-19T12:32:34Z'
title: 2025.09.19.12.32.34
filename: Pipeline Validation Strategy
description: >-
  This document outlines a strategy for validating pipeline workflows, focusing
  on ensuring idempotency, minimal file alterations, and version control
  integration. It addresses the challenges of managing unique documentation
  within version control systems and proposes a structured approach to maintain
  clean, reproducible pipeline execution.
tags:
  - pipeline validation
  - idempotency
  - version control
  - documentation management
  - github workflows
related_to_uuid: []
related_to_title: []
references: []
---
Keep the thoughts together when you are bouncing around like this and not actually getting any thing done it means you have a bunch of ideas, and like half a plan,
and it's all in your head, and parts of one plan bleeeed into the others.

So what were we thinking about? What were the threads?
- Helping greg validate his codex sdk works on ubuntu
- Start a pipeline validation worktree with it's own branch
  - Document what steps of which pipelines work correctly
  - Catalog all errors encountered
  - ensure the current documentation surrounding the pipelines is accurate
  - Ensure every pipeline is idempotent
  - Ensure every pipeline does not alter it's inputs in any ways
    - Docops currently runs a bash command that copies the stuff over, then it mutates that. It isn't what I wanted but.. it does do the job I need it to do, except in the case that
    - the files already exist.
    - Maybe it isn't totally possible to not alter them at all...
    - No. No it is. The front matter is not the source of truth. It's generated from the level cache
  - validate behaviors
  - get codex cloud to replicate the full pipeline
    - create a small fixture folder with enough examples to excercise the full pipeline in a reasonable amount of time
    - We probably have to ask codex to execute each step of each pipeline individually in order.
    - ... or we just start a background task and see how that goes... 
    - If we could run this stuff in the background while codex does other work...
    - we could set up a pipeline where codex possibly long running tasks to the workers...
    - I wonder exactly the extent of the persistence is...
    - You probably to garentee every boot would start a job on a file or files that isn't currently running....
    - but how do you keep them in sync?

What else were we thinking about?

The github branch workflow.
Recovering the unique docs
The whole train of thought about workflows was contained in a unique note that is now gone, and I haven't been able to find the note it was renamed to.
This is why the files need to remain unchanged and kept.
It can make version control noisy, but that is only if you make a whole load of changes all at once.
Once everything is validated and known to be working correctly, running the pipelines will only alter new files
or files that exist along a path where the behavior of the pipeline has changed.
When we do change the pipeline, we don't over write the target it initially had.
We need to ensure that all changes to the pipeline mean that the target folder or at least the names of the target files
reflect that some how.

It should be easy enough to be tracking versions
We need to just start tracking versions in general.
I need a way to automaticly do it.
That is why I am thinking about the git pipeline

Since I just want to get myself moving, I will accept the current pipeline doc.

We've gotten a bit hyper fixated on the github flow, that is fine. It is important. It could use some of that deep effort.
Let's zoom out for a sec though.


We are trying to deal with all of the open PRs right now.
The reason we were fixated on the github workflows is because we wanted to begin respecting them at least partially.
We managed to document the current adhoc flow, it works, but I end up with massive prs with hundreds of changed files in them
and a lot of noise, because right now every unique note I write ends up in version control.

Which isn't even a problem.
It's a problem when they've accumulated over 10-20 prs and I have
hundreds of files and at least a few dozen of them are these unique documents.

Unique docs should, could, probably end up in this flow where they are detected pre commit, and merged into their own branch.

The commitment should be documentation in the documentation branches, and dev in the dev branches. Review all the way up the chain.
We may still end up with a huge pr at the end, but we'll have already seen all of it in prior merges, and it is mostly a cerimonial PR from staging into main.
I say mostly. Because there are times where something does have to get directly into main, like a dependabot alert, or a critical bug fix, etc.
Critical stuff can go into main directly, so it's possible for staging and main to diverge if not tracked and kept up to date.


Now what is it that I am making?
We are working on promethean. A metacognaitve operating system.
We are realizing the dream of the lisp machines, but in a way they would have never anticipated.

The only language that matters is your intention.
Intention is translated down to exactly the software representation most useful to your intent at the time.
If you intend an action often, that action gets increasingly optimized.

An action may just start as a fully LLM request. Where you use it like you use LLMs currently, write out a really
structurally sound prompt with the clearest intent, you want  outcome given A, B, C, ...
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
