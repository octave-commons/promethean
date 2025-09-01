The `run` command is a powerful feature in Text Generator template language that allows the execution of another template within the context of the current one. When using `run`, the called template inherits the context and scope of the parent template.

## Usage

### Inline Mode

#### Syntax

```
{{run "packageId/promptId" "output" "input" "target"}}
```

- `"packageId/promptId"`: Specify either the `promptId` alone if it’s in the same package or the full `packageId/promptId`.
- `"output"` (optional): The variable where the result of the executed template is stored, by default the results are saved in `"packageId/promptId"` variable.
- `"input"` (optional): The data passed to the target template.
- `"target"` (optional): The variable name in the target template where the input will be stored (default is `tg_selection`).

#### Examples

**Passing `selection` as `tg_selection` to the next template:**

```
{{run "local/summarize" "summary" selection}}
```

**Passing a direct string as `tg_selection`:**

```
{{run "local/summarize" "summary" "text to be summarized"}}
```

**Using a title as an idea for a brainstorm template:**

```
{{run "local/brainstorm" "ideas" title "idea"}}
```

**Contents of `local/brainstorm` template:**

```
brainstorm ideas about {{idea}}
```

### Block Mode

#### Syntax

```
{{#run "packageId/promptId" "output" "target"}}
    {{input}}
{{/run}}
```

**Simple form passing `selection`:**

```
{{#run "default/summarize" "summary"}}
    {{selection}}
{{/run}}
```

**Passing a direct string:**

```
{{#run "default/summarize" "summary"}}
text to be summarized
{{/run}}
```

**Using a title as an idea for brainstorming:**

```
{{#run "local/brainstorm" "ideas" "idea"}}
    {{title}}
{{/run}}
```

#### Additional Context

- **Pass additional variables or context** by wrapping them within the `run` block. The context should be JSON-serializable.

```
{{#run "default/summarize" "summary"}}
{
  "selection": "{{escp2 title}}",
  ... other config
}
{{/run}}
```

## Key Points

- **Use** the `run` command to execute another template from within your current template.
- **Ensure** that the `input` provided to the `run` command is the data you want the target template to process.
- **Store** the result of the executed template in an `output` variable.
- **Pass** additional context or variables in block mode when more complex data structures are required.
- **Default target variable** is `tg_selection` if no other target is specified.

With these guidelines, you should be able to effectively **utilize** the `run` command in your templates to enhance modularity and reusability of your code.