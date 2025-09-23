# Promethean/system architecture

Where packages are generalized reusable collections of logic that are defined by
configuration.

The `promethean/system` files are `.json`, `.yml`,`.edn`, `clj`, `.md`, or `.org` files. They
can really be anything you define a grammar for.

In the case of a markdown file, an LLM interprets it based on the folder you put
it in and existing vocabulary of the system.
They act like sorta loose services, over time as a markdown (or any other config
file whose grammar definition requires a language model)

If these natural language unit definitions get used frequently enough,
it triggers an optimization event.

The system looks at the context/system state at the time of the units use, and at the outcome
these smart units may have to run more than once before their goal is achieved.

The user is either directly observing the unit when it is used and confirms it has succeeded directly at that point,
or the user user can approve it asynchronously.

With enough confirmations, the system tries to convert the markdown to a structured format.
The structured format is either approved or denied by the user.

- daemon
- conditions
- events
- triggers
- schedules
- actions

## daemon
A Daemon is a long running background process. In our system, daemons are
managed by pm2.
## conditions

Conditions describe a... well a condition that the system can use to decide when
an event has occurred. They are distinct from events because they are composable
units. By themselves they don't do anything.

A few examples of conditions you might define:
```clojure
{
:is-raining (is (weather :raining :place 'home))
:is-hot (is (temp-in (raining (in :place 'home))) (over 80))
}
```

or possible in markdown:

```markdown
# Weather Conditions
Sometimes the weather outside affect my decisions.
Two condtions that I want to act on are:

# Is it raining outside?
You can tell by asking the weather provider about the current weather where I
live.

# Is it hot out?
You can tell it's hot out if the weather provider says it is over 80f.
```


## Events

Events are named happenings that are emitted when a system condition has been
met.


## Actions

Actions are... well they are actions the system can take in response to an event


## Schedules

Schedules are time based events. You describe them the same way you do events,
just with time conditions

## Triggers

A trigger puts actions, events, and conditions together.

Example:

```markdown

if it is rainingo outside, order an umbrella from amazon.
```

functionally, everything you want could be described in a trigger.
It's just be more work.
