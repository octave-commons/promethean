# Shared.ecs.ComponentSystem

## arguments

([[process.md]] interface
                 (components ((create Ordered-map)))
                 (pool ((create Dynamic-pool)  interface))
                 (thread (Promise.resolve)))

## description

An Abstract interface for defining game systems. By default updates its components every tick. This behavior can be overriden. Requires an `_updateComponent` implementation Optionally accepts `_prepare` and `_cleanup` methods