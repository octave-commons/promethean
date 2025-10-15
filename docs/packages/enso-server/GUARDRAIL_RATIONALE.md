# enso-server — Guardrail Rationale Events

Status: ✅ shipped with cephalon guardrail rationale payload update.

Emits a rationale before tool invocation when evaluation mode is on.

## Suggested Payload
```ts
export type ActRationalePayload = {
  callId: string;
  rationale: string;
  policy?: string;            // defaults to "morganna@1" in cephalon
  evidence?: readonly string[];
  evidenceKind?: 'url' | 'messageId' | 'note'; // defaults to 'note'
};
```

## Diagram
```mermaid
sequenceDiagram
  participant C as Client
  participant S as enso-server
  participant A as EnsoChatAgent
  C->>S: tool.call(request)
  S->>A: evaluate policies
  A-->>C: guardrail.rationale(payload)
  S-->>C: tool.call result/error
```

## Notes
- Consider renaming event from `act.rationale` to `guardrail.rationale`.
- Keep payload slim; let UI render text/links based on `evidenceKind`.
- Expose room flags `{ eval: true|false }` for clients.
