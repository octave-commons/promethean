# System Markdown DSL Specification

This document formalizes the markdown-based domain specific language (DSL) used
inside the `system/` directory. The goal is to provide an unambiguous schema
that agents can validate and transform into structured data without guessing at
semantics.

## 1. Document Grammar

The DSL is Markdown with a constrained structure. The grammar below is expressed
in Extended Backus–Naur Form (EBNF). `Text` represents arbitrary Markdown
phrasing content, and `Identifier` is an ASCII string without leading/trailing
whitespace. Headings follow standard Markdown semantics.

```ebnf
Document        ::= FrontMatter? UnitHeading Section*
FrontMatter     ::= "---" NewLine YAMLBlock "---" NewLine
UnitHeading     ::= Heading(level=1, text=Identifier)
Section         ::= SectionHeading SectionBody
SectionHeading  ::= Heading(level=2, text=SectionName)
SectionName     ::= "daemon" | "conditions" | "events" | "actions"
                   | "schedules" | "triggers"
SectionBody     ::= TableBlock (NewLine+ ParagraphBlock)?
TableBlock      ::= PipeTable
ParagraphBlock  ::= Paragraph+
PipeTable       ::= TableHeader NewLine SeparatorRow NewLine TableRow*
TableHeader     ::= "|" HeaderCell ("|" HeaderCell)* "|"
SeparatorRow    ::= "|" SeparatorCell ("|" SeparatorCell)* "|"
HeaderCell      ::= Text
SeparatorCell   ::= (":"? "-"+ ":"?)
TableRow        ::= "|" Cell ("|" Cell)* "|" NewLine
Cell            ::= Text
```

Additional free-form Markdown (e.g., explanatory paragraphs) may appear after a
section table, but parsers may ignore it. Any content outside the defined
sections is treated as commentary.

### 1.1 Normalization Rules

* Section names are case-insensitive and trimmed before matching.
* Table headers are normalized by lower-casing and collapsing non-alphanumeric
  characters to single underscores.
* Empty rows are ignored.

## 2. Section Schemas

Each section has a dedicated schema that maps normalized headers to structured
fields. Required columns must be present in the section table. Optional columns
may be omitted or left blank.

### 2.1 `daemon`

The daemon section describes the long-running process managed by PM2.

| Header       | Required | Description                                                |
|--------------|----------|------------------------------------------------------------|
| `field`      | ✓        | Logical field name (e.g., `id`, `command`).                |
| `value`      | ✓        | Field value.                                               |
| `notes`      | ✗        | Free-form commentary about the field.                      |

The parser recognizes the following field values (after normalization):

* `id` (required): Unique identifier for the daemon.
* `description`: Human-readable summary.
* `command`: Executable or script entry point.
* `args`: Comma/semicolon/newline separated list of command arguments.
* `cwd`: Working directory.
* `env`: Semicolon/comma/newline separated `KEY=VALUE` assignments.
* `restart_policy`: Restart strategy indicator (e.g., `always`).

Unrecognized fields are retained as additional key/value pairs for downstream
consumers.

### 2.2 `conditions`

| Header         | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `id`           | ✓        | Condition identifier slug.                       |
| `description`  | ✗        | Narrative explanation of the condition.          |
| `expression`   | ✗        | Structured expression or pseudocode.             |
| `tags`         | ✗        | Comma/semicolon separated tags.                  |

### 2.3 `events`

| Header         | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `id`           | ✓        | Event identifier.                                |
| `when`         | ✓        | Comma/semicolon separated list of condition ids. |
| `description`  | ✗        | Summary of the event semantics.                  |
| `tags`         | ✗        | Comma/semicolon separated tags.                  |

### 2.4 `actions`

| Header         | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `id`           | ✓        | Action identifier.                               |
| `type`         | ✓        | Verb that classifies the action.                 |
| `target`       | ✗        | Subject or resource affected.                    |
| `parameters`   | ✗        | `KEY=VALUE` pairs separated by comma/semicolon.  |
| `description`  | ✗        | Optional human-readable narrative.               |

### 2.5 `schedules`

| Header         | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `id`           | ✓        | Schedule identifier.                             |
| `cron`         | ✓        | Cron-like expression.                            |
| `timezone`     | ✗        | IANA timezone identifier.                        |
| `description`  | ✗        | Summary of the time window.                      |

### 2.6 `triggers`

| Header         | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `id`           | ✓        | Trigger identifier.                              |
| `when`         | ✓        | Comma/semicolon separated list of events.        |
| `actions`      | ✓        | Comma/semicolon separated list of action ids.    |
| `description`  | ✗        | Narrative context.                               |

## 3. Semantic Notes

* Identifiers must be unique within their respective sections.
* References in `when` or `actions` columns must correspond to identifiers
  declared elsewhere in the document (the parser records unresolved references as
  diagnostics).
* `args`, `tags`, and similar list-valued fields accept comma, semicolon, or
  newline separators. Whitespace around items is trimmed.
* Environment variables (`env`) are parsed into key/value pairs; malformed
  entries generate parser diagnostics and are ignored.

## 4. Example

```markdown
---
unit: weather-monitor
version: 1.0.0
---

# Weather Monitor

## Daemon
| Field | Value |
|-------|-------|
| id | weather-monitor |
| command | node services/weather/index.js |
| args | --poll, --interval=5m |
| env | API_KEY=secret;CITY=seattle |
| description | Watches current weather conditions. |

## Conditions
| id | description | expression |
|----|-------------|------------|
| is_raining | Rain detected by provider. | weather.status == "raining" |
| is_hot | High temperature threshold. | weather.temperature > 80 |

## Events
| id | when | description |
|----|------|-------------|
| rain_started | is_raining | Rain has begun. |
| heat_wave | is_hot | The temperature exceeds threshold. |

## Actions
| id | type | target | parameters |
|----|------|--------|------------|
| notify_slack | notify | slack-channel | channel=#weather |
| order_umbrella | purchase | amazon | asin=B00UMD8XZO |

## Schedules
| id | cron | timezone |
|----|------|----------|
| morning_check | 0 7 * * * | America/Los_Angeles |

## Triggers
| id | when | actions |
|----|------|---------|
| rain_alert | rain_started | notify_slack |
| hot_response | heat_wave | notify_slack, order_umbrella |
```

## 5. Parser Expectations

A conforming parser MUST:

1. Extract the YAML front matter as metadata.
2. Capture the unit title from the level-1 heading.
3. Parse each recognized section table into structured records.
4. Normalize identifiers and list-like values using the rules above.
5. Emit diagnostics when required sections are missing, headers are malformed, or
   references cannot be resolved.

Consumers can rely on the resulting AST to generate JSON, TypeScript objects, or
other target formats without heuristics.
