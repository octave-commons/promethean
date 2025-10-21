# Spawn Command

The `spawn` command creates a new OpenCode session and immediately sends it a "spawn" message. This is useful for quickly initializing sessions with a predefined starting message.

## Usage

### As a subcommand of sessions:

```bash
opencode sessions spawn [title] [options]
```

### As a top-level command:

```bash
opencode spawn [title] [options]
```

## Options

- `[title]` - Optional session title (defaults to "Spawn Session")
- `--title <title>` - Alternative way to specify session title
- `--message <message>` - Custom spawn message (defaults to "spawn")
- `-f, --file <path>` - Read spawn message from a file

## Examples

### Basic spawn with defaults:

```bash
opencode spawn
```

Creates a session titled "Spawn Session" with the message "spawn"

### Custom title:

```bash
opencode spawn "My Agent Session"
```

Creates a session with custom title

### Custom message:

```bash
opencode spawn --message "initialize agent"
```

Creates a session with a custom spawn message

### Read message from file:

```bash
opencode spawn --file ./spawn-prompt.txt
```

Creates a session using message content from a file

### Full example:

```bash
opencode spawn "Development Session" --message "start development environment" --title "Dev Session"
```

## Output

The command outputs:

- Session ID
- Session title
- Creation timestamp
- Message ID (if message was sent)
- Message content

## Return Value

The spawn action returns a JSON object with:

```json
{
  "success": true,
  "session": {
    "id": "session-id",
    "title": "session-title",
    "createdAt": 1234567890
  },
  "message": {
    "id": "message-id",
    "content": "spawn-message",
    "sentAt": 1234567890
  }
}
```

## Error Handling

The command will exit with error code 1 if:

- OpenCode server is not reachable
- Session creation fails
- Message sending fails
- File reading fails (when using --file option)
