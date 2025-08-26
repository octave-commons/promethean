# Adding Build Targets

Promethean's Makefile is generated from modular command definitions.
Commands live outside the generator so new build targets can be added
without editing `Makefile.hy` itself.

## Hy Modules

1. Create functions with `defn-cmd` in a Hy module under `mk/`.
2. Ensure the module returns a `commands` map and `patterns` list via a
   `load` function.
3. `mk/generator.hy` automatically imports these modules through
   `collect-commands`.

## JSON Descriptors

Simple shell-based targets can be described in a JSON file. By default
`collect-commands` looks for `mk/commands.json` and registers each
entry as a target that runs the given shell snippet.

```json
{
    "hello": "echo hello"
}
```

## Workflow

- Add your module or descriptor.
- Run `hy Makefile.hy generate-makefile` to regenerate the Makefile.
- New targets are immediately available via `make <target>`.
