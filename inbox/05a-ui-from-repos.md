# Give me a UI using the github repos I already shared with you

You already have all the ingredients; the cleanest move is to build the KM / labeling UI as **a new “Knowledge Lab” surface** on top of:

- **Ragussy frontend** → ingestion, document DB profiles, retrieval debug.
- **Shibboleth UI** → labeling \& translation workflows.

Below is a concrete layout and component skeleton you can drop into those repos.

***

## 1. Overall UX shape

Single “KM Console” with three main views:

1. **Sources \& Ingestion** (Ragussy)
    - Choose tenant + document DB profile.
    - Kick off ingestion (forum/wiki/files).
    - See progress, ETA, resumable runs.
2. **Ask \& Inspect** (Ragussy)
    - Chat with the tenant’s KB using Ragussy RAG provider.
    - Show retrieved chunks with doc titles / links.
3. **Label \& Improve** (Shibboleth)
    - Same question/context/answer as in Ask view.
    - Right‑hand label panel for correctness/groundedness/etc.
    - “Save label” writes into Shibboleth‑lite label store.

You don’t need new infra; just **one new route in each frontend** and a thin glue API.

***

## 2. Ragussy: add a Knowledge Console route

In `ragussy/frontend`, add a `/next/knowledge` route alongside the existing `/next/*` ops pages.

Conceptual component tree:

```tsx
// frontend/src/routes/NextKnowledgeConsole.tsx
import { TenantSelector } from "./components/TenantSelector";
import { DbProfileSelector } from "./components/DbProfileSelector";
import { IngestionPanel } from "./components/IngestionPanel";
import { AskPanel } from "./components/AskPanel";
import { ContextPane } from "./components/ContextPane";
import { LabelingPane } from "./components/LabelingPane";

export function NextKnowledgeConsole() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  return (
    <div className="flex h-full">
      {/* left rail: tenant + source/ingest */}
      <div className="w-72 border-r flex flex-col">
        <TenantSelector value={tenant} onChange={setTenant} />
        <DbProfileSelector tenant={tenant} value={profile} onChange={setProfile} />
        <IngestionPanel tenant={tenant} profile={profile} />
      </div>

      {/* center: ask + context */}
      <div className="flex-1 border-r flex flex-col">
        <AskPanel
          tenant={tenant}
          profile={profile}
          onAnswered={setInteraction}
        />
        <ContextPane interaction={interaction} />
      </div>

      {/* right: labels (Shibboleth-lite) */}
      <div className="w-96">
        <LabelingPane interaction={interaction} tenant={tenant} />
      </div>
    </div>
  );
}
```

Key points:

- `AskPanel` calls Ragussy’s existing OpenAI‑compatible `/v1/chat/completions` or `/api/ragussy/chat` with the selected `tenant` / profile metadata.
- `ContextPane` shows retrieved chunks from Ragussy’s retrieval diagnostics APIs (you already have RAG debug surfaces).
- `LabelingPane` posts a JSON record into a new Shibboleth‑lite API (`POST /api/km-labels`).

You can bolt this into the existing `/next/*` routing with minimal churn.

***

## 3. Shibboleth: reuse its UI for label editing

Shibboleth already has a Vite + TS UI app in `shibboleth/ui`. Treat that as the **labeling workstation**, not the whole console.

Add a simple page that can run standalone *and* be embedded via iframe into Ragussy’s `LabelingPane` if you want strict separation:

```tsx
// shibboleth/ui/src/routes/KmLabeler.tsx
export function KmLabeler() {
  const [example, setExample] = useState<KmExample | null>(null);

  useEffect(() => {
    // simple: listen for postMessage from Ragussy, or poll Shibboleth API
    window.addEventListener("message", (event) => {
      if (event.data?.type === "km-example") {
        setExample(event.data.payload);
      }
    });
  }, []);

  if (!example) return <div className="p-4 text-sm text-gray-500">No example selected.</div>;

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <section className="text-sm">
        <h2 className="font-semibold mb-1">Question</h2>
        <p>{example.question}</p>
      </section>

      <section className="text-sm">
        <h2 className="font-semibold mb-1">Answer</h2>
        <p>{example.answer}</p>
      </section>

      <section className="flex-1 text-xs overflow-auto">
        <h2 className="font-semibold mb-1">Context</h2>
        {example.context.map((c) => (
          <div key={c.id} className="mb-2 border-l pl-2">
            <div className="text-gray-500">{c.sourceTitle}</div>
            <div>{c.text}</div>
          </div>
        ))}
      </section>

      <LabelForm example={example} />
    </div>
  );
}
```

`LabelForm` implements the schema we sketched earlier (correctness, groundedness, risk, translation‑quality, gold‑answer). It just `POST`s to Shibboleth’s backend (`/api/km-labels`). Shibboleth’s Clojure side can then compile that into the Shibboleth‑lite DSL/pipeline.

On Ragussy side, `LabelingPane` can either:

- Embed the Shibboleth UI via `<iframe src="https://shibboleth-host/km-labeler" />` and `postMessage` the example; or
- Call Shibboleth’s backend directly and render labels natively, if you don’t want iframe.

***

## 4. Minimal contract between the two

Define a shared JSON envelope (what Ragussy sends, what Shibboleth expects):

```jsonc
{
  "example_id": "uuid",
  "tenant_id": "acme",
  "domain_id": "support",
  "question": "How do I reset my SSO token?",
  "question_lang": "en",
  "answer": "…",
  "answer_lang": "en",
  "context": [
    {
      "id": "doc-123#chunk-4",
      "source_title": "SSO Runbook",
      "source_url": "https://confluence/…",
      "text": "…"
    }
  ],
  "model": "qwen-14b",
  "metadata": {
    "ragussy_run_id": "…",
    "timestamp": "…"
  }
}
```

Labels come back as:

```jsonc
{
  "example_id": "uuid",
  "tenant_id": "acme",
  "labels": {
    "correctness": "partially-correct",
    "groundedness": "partially-grounded",
    "risk": "safe",
    "translation_quality": "good",
    "overall": "needs-edit"
  },
  "gold_answer": "…",
  "notes": "…",
  "labeler_id": "user-123",
  "labeled_at": "…"
}
```

Everything else (pipelines, manifests, training datasets) is Shibboleth‑lite behind the scenes.

***

If you tell me whether you’d rather:

- Embed Shibboleth’s UI inside Ragussy, or
- Keep them as two separate web apps talking via API,

I can give you a more exact snippet (e.g. the `postMessage` wiring or the fetch call) using the repos you already have.

---
