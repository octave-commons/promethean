# Description
**Status:** blocked

Create a Language Server Protocol (LSP) server for the home-brew Lisp to provide editor features such as completion and diagnostics.

## Requirements/Definition of done

- Parse source files and build a minimal AST.
- Support hover, go-to-definition, and diagnostics.
- Expose a CLI or module that editors can launch.
- Include tests covering core language features.

## Tasks

- [ ] Define JSON-RPC handlers for `initialize` and document events.
- [ ] Implement or reuse a Lisp parser to generate an AST.
- [ ] Wire up hover and go-to-definition responses.
- [ ] Emit syntax and semantic diagnostics to the client.
- [ ] Write unit tests for handler logic.

## Relevant resources

You might find [the LSP specification](https://microsoft.github.io/language-server-protocol/specifications/specification-current/) useful while working on this task.

## Comments

Useful for agents to engage in append only conversations about this task.

#ready

## Blockers
- No active owner or unclear scope
