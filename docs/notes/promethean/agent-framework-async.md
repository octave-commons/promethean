Ok, this is the part I want to zoom out a bit and think about our agent framework.
# Agent framework
I want async sub agents.
The whole framework should be async first, I usually use JS, so I'd be trying promises/futures, but
they may not be the best way to get concurrency going in clojure
I want an agent mode that is like... hierarchical?
I want it to start with a very powerful model, and it has tools to create a bunch of agents in paralell.
the top level agent will sleep, and periodicly start back up while there are still sub agents.
And it can go multiple levels deep,
but increasingly restricting the ability of the model allowed to be used.

Parent agents will decide a system prompt (potentially from a library of existing ones, or create and manage prompts it's self.),
a tool set (from a list of existing tools)

Each agent can send messages to the parent agent, in a special ephemeral context they use to inform each others states through conversation.
The system tracks files being operated on, it locks them.
If an agent attempts to use a locked file, it can check who has it locked, and open up another special conversation thread.

The agents are able to talk to each other, and there is the agent graph (more of a tree)
And there is a conversational graph, by default they can only send messages to their parent agent, and child agents, but this can be configurable.

What else?

## Brainstorming a highly concurrent hierarchical problem solving machine
I was thinking of a way you could describe a problem hierarchically, I've written som pseudo code out about this a while ago like

```clojure
(task "create and integrate a full stack web chat"
  (task "create a frontend for a websocket based chat app"
    :cwd "frontend"
    :spec [(sh "npm test") (sh "npm typecheck") (require-file "README.md")])
  (task "create a clojure websocket backend to a web chat"
    :cwd "backend"
    :spec [...]))
```

See I'm not actually sure about it now thinking about it...
Like... I think I want to be able to describe it like this, but I don't know if I want to be writing these.
I think they make a good way of the machine communicating it's state to me, that I could edit, and reevaluate?

What I am pretty sure of is having a top level agent who's job is to break down your task into sub problems, and delegate those tasks.
And for each agent in turn, to break down it's given problem into smaller problems, and delegate.

The idea would be that the agents break it up more and more until the best answer is obvious to the agent.

A tree is the easiest way to visualize it, but it could be a cyclic graph too I supose, but that would be much harder to design a
system around at first, with out having the hierarchical tree delegation system works


# Benchmarking

## Agentic evaluation
I want to add an coding agent benchmark, can it take a prompt, and generate a program that passes a test suite?
I only care about clojure, clojurescript, and typescript, so we can put together like a login page or something for them to have to create.
An echo server
a simple chat app with websockets with out auth
a simple game

While writing benchmarks for snorkel.ai's terminus bench contributions, I realized how hard it can be to actually measure
if they are doing the job correctly.

They're prompts are valuable for sure, but there is some information I have to hand them in their framework which... sometimes there are details that are just not important, and when I write it and assign that task to a person, as long as the test passes, and it accomplishes the goal,
the shape of the data or exact data structures or libraries they use is unimportant.

But I can inspect that persons code and tests and see it's good.
The agent benchmark, if I ask for a login page and I don't specify what the id is for the login forum, what test can I write that is flexible enough for that?

To bench mark prompts in the style humans would actually write to them, you'd need a more complex evaluation metric,
the checker has to be much more structured.

Something like an endpoint path, I would absolutely almost always specify very clearly in a spec.
If there was a mention of that associated with a button...

But that level of inspection..
They definately could not afford to do that in terminus, cause every domain, ever language, data format, is going to have different ways you could fuzzy proove it did something correctly with fuzzier specs.

## Test suite

I want to treat these all as a full suite of benchmarks meant to be ran together that output a comprehensive report for every model.
I want there to be an interactive http server experience
I want to avoid loosing benchmarking progress if my computer crashes or something while running them, so the data has to be streamed to the files.

All of the files should go into a single `reports/` folder, each suite get's it's own subfolder, and we have an extensible way of describing new test suites so they all follow the same pattern and integrate cleanly into the suite and the UI.

I want to have a simple websocket based agent chat connected to a docker container which we manage with the suite.
So we need to set up some container orchestration stuff.

Maybe DSL for the containers?

