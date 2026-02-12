There has to be a better way to persist memories than leaving a trail of markdown files
The annoying part would be how to make it readable and committable

Maybe it is okay to just use those files,
but you also keep a json index?
only those can get really big...
so you only keep that to rebuild the index on another machine
you keep a more optimized version of the index that works fast

```mermaid

(remember details) -> has-related-memory?
has-related-memory? -> yes -> increase-related-memory-ttl
has-related-memory? -> no -> (create-new-memory details)

(recall details effort) -> (compile-context details effort)
```


```elisp
(store (struct (meta (struct title description)) content (sections ())))
```

## embedding flow

```mermaid
-> (struct title description content) -> (map  split-semenaticly) -> (map embed)
```


## Memory consolidation

as new memories are added, similar memories compound each other
Memories are never totally forgotten
but become less accessible in phases
A memory that expires is persisted if it was accessed frequently while in memory
A memory that is not persisted is marked for consolidation when it expires.
When enough memories are marked for colsolidation, they are compacted given related context.

```mermaid
in-memory -> tts-expires -> should-persist?
should-persist? -> yes -> enqueue-file-write
should-persist? -> no -> enqueue-consolidation
```

## Context

When searching for memories, related context is gathered from requested data stores.
Context is sorted by a relevancy score, which is a durived from simiarlity to the query,
the strength of the context items relationship to other recalled context, last read,
and time of creation.

Every time a context is compiled, each recalled memory is connected to all recalled items if not already connected
existing connections between the context elements is increased
and all existing connections to unrecalled elements is decreased.

Before connections are updated, memories which are strongly associated with the context through connections
are added into context, and memories that are similar to each other are pruned, with the memory most strongly associated with the query
and context surviving.
The memories that are pruned are considered "unrecalled" when the connections are updated.

depending on the requested effort of recall, this loop is executed a few times until either the limit set by the level of effort is reached,
or when there are no longer any strong associations outside to memories outside of the context.

Once the context is compiled, it is then serialized into markdown from the graph of associations


## Forming memories

Every event in opencode is intercepted and stored in this memory system.
It should be a simple process.
similar events get consolidated thought simiarlity based cacheing

Really the whole loop should be at some level cacheable..
the starting behaviors are all very similar
The agent shouldn't even need to use tools to get 90% of the code they need.

## Indexing

When a project is first opened it needs to be indexed.
programs are broken down structurally and described and documented.
functions, classes, all get docstrings
types, interfaces, namespaces are annotated with simple comments.
an initial graph of relationships is formed based on similarity
documentation, tutorials, guides, references, research papers, articles, social media posts
Whatever, is pulled from a search engine using terms extracted from the knowledge base.
the remote documents are each scored for relavence to the project
the most relevent are directly saved

## Social connections

An agent is run continuously making decisions as to where it should send it's next response,
if it should respond, etc.

At the beginning of each term, starting from a seed query, a context is collected, and several agent loops are started with different roles.
- thinker - the thinker thinks about the context, it forms beliefs, creates theories
- proover - the proover prooves what the thinker is thinking
- collaborator - consider's it's self with relation to a social network to influence, understand, facilitate, question, consider mutual self interests, and work for/with it's peers.
- planner - Creates objectives from context which are executed, or documented, by the actor
- actor - effects the world outside of it, sends messages, writes files, generally takes actions
- learner - a model that is actively self training, labeling. It is optimizing it's self as a process of global system optimization.
- trainer - orchestrates training of models for specific purposes
- observer - a larger model who selectively processes event logs the sensor has prioritized to understand the signal
- sensor - a small simple model that quickly processes event logs to make snap decisions about sudden changes in state

each tool call causes the context to recompile preserving the most recent elements of the agents loop
including outside context from all sources, including each other agents loop.

## Continuous indexing

once the system is initially indexed, several event listeners/watchers are set up to incorperate new context as it is created
