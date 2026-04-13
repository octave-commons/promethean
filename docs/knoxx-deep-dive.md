# Knoxx Deep Dive

**A grounded exploration of what Knoxx is, how it handles translation, how it handles CMS, and what problems it solves.**

---

## What Is Knoxx?

Knoxx is a **local-first knowledge vault and garden system** — a RAG (Retrieval-Augmented Generation) stack with operations UI, document ingestion workflows, and OpenAI-compatible runtime endpoints. The name derives from Fort Knox: a secure vault for your knowledge. The garden concept draws from Quartz and the Pentagon's central garden — curated, navigable knowledge spaces.

### Core Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend  │────▶│    Ingestion     │────▶│ OpenPlanner │
│   (React)   │     │   (Clojure)      │     │ (TypeScript)│
│             │◀────│                  │◀────│             │
│   CMS Page  │     │  /api/query/*    │     │ /v1/docs    │
│   Query     │     │  /api/ingestion/*│     │ /v1/search  │
└─────────────┘     └──────────────────┘     └─────────────┘
```

**Data Flow**:
1. Frontend provides operator UI for ingestion, query, CMS, gardens, and translation review
2. Ingestion worker discovers files, classifies into lakes, writes to OpenPlanner
3. OpenPlanner stores documents/events with full-text search + vector search

### Repository Layout

```
knoxx/
├── frontend/       # React + Vite + TypeScript UI
│                   # - CMS, Ingestion, Query, Gardens, Translations pages
│
├── backend/        # ClojureScript (CLJS) backend
│                   # - OpenAI-compatible endpoints
│                   # - llama.cpp control
│                   # - Knoxx RAG/Direct proxy
│                   # - Translation routes proxy
│
├── ingestion/      # Clojure worker
│                   # - File browser and preview
│                   # - Source and job management
│                   # - Federated FTS query
│                   # - Writes to OpenPlanner
│
└── discord-bot/    # Optional Discord integration
```

### Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **CLJS Backend** | Leverages Clojure's expressiveness for agent runtime logic; compiles to efficient Node.js via shadow-cljs |
| **OpenPlanner as Truth** | Single canonical data store for documents, events, translations — no split-brain between "knowledge base" and "CMS database" |
| **Queue-Driven Translation** | Translation jobs are created on CMS publish, not by background scanning; garden-targeted, not arbitrary |
| **Postgres Policy DB** | Tenant/org/user/RBAC lives in Postgres; content lives in OpenPlanner |

---

## How Knoxx Handles Translation

### The Translation Problem

Machine translation (MT) is never perfect. To make it useful for professional content, you need:

1. **Chunking**: Break documents into translatable segments
2. **MT Processing**: Call translation models (GLM-5, etc.)
3. **Human Review**: Experts validate, correct, or reject translations
4. **Training Feedback**: Approved corrections become training data for MT fine-tuning

### Knoxx's Translation Architecture

The canonical flow is **queue-driven and garden-targeted**:

```
CMS publish to selected garden
  -> OpenPlanner creates translation_jobs per target language
  -> translation-worker consumes queued jobs
  -> translation-worker writes translation_segments
  -> Knoxx /translations review UI loads and labels segments
  -> approved labels/corrections feed SFT export + graph memory
  -> public garden routes may serve translated content when available
```

### Key Properties

- **Garden-Targeted**: Translation is triggered when publishing to a garden with `target_languages` configured — not a generic background scan
- **Queue Truth**: `translation_jobs` collection holds queued work
- **Review Truth**: `translation_segments` + `translation_labels` collections hold human review outcomes
- **Knoxx Owns the UI**: The review workbench at `/translations` is part of Knoxx
- **OpenPlanner Owns Data**: All canonical translation data lives in OpenPlanner

### Data Model

**OpenPlanner Collections**:

| Collection | Purpose |
|------------|---------|
| `translation_jobs` | Queued translation work items created from CMS/garden publication |
| `translation_segments` | Machine-translated segments awaiting review or already reviewed |
| `translation_labels` | Human review labels and optional corrections |
| `events` | Source documents and CMS publication metadata |
| `graph_nodes` / `graph_edges` | Approved translation examples for MT context enrichment |

### Translation Worker

Located in `scripts/translation-worker.ts`:

1. Polls `translation_jobs` queue
2. Loads source text from `events`
3. Chunks text into segments (~500 tokens)
4. Calls MT provider via OpenAI-compatible chat completions
5. Writes `translation_segments`
6. Marks jobs complete/failed
7. Queries graph memory for few-shot examples

### Review UI

Located at `/translations` (`TranslationPage.tsx`):

- **Segment List**: Filter by project, status, target language
- **Review Card**: Side-by-side source and translation
- **Label Dimensions**:
  - `adequacy`: Does the translation preserve meaning?
  - `fluency`: Is the translation natural?
  - `terminology`: Are technical terms correct?
  - `risk`: Any safety/regulatory concerns?
  - `overall`: `approve` / `needs_edit` / `reject`
- **Correction Field**: Optional corrected text for training data
- **SFT Export**: Download JSONL for supervised fine-tuning

### Manifest and Stats

The `TranslationManifestCard` shows:

- Total segments
- Pending / In Review / Approved / Rejected counts
- Correction rate
- Labeler statistics

### Problems Solved

| Problem | Knoxx Solution |
|---------|----------------|
| **MT drift**: Machine translations lose meaning | Human review with adequacy/fluency labels |
| **No feedback loop**: MT never improves | Corrections feed SFT export for fine-tuning |
| **Inconsistent terminology**: Terms translated differently per segment | Terminology label dimension + context enrichment |
| **Opaque process**: Can't see translation state | Manifest + status visibility in review UI |
| **Walled data**: Translations trapped in external services | All data in OpenPlanner, exportable for training |

---

## How Knoxx Handles CMS

### The CMS Problem

Traditional CMS systems have a fatal flaw: **the CMS database is disconnected from the knowledge base**.

```
BROKEN:
ingestion -> Vector Store
CMS -> Postgres documents table
publish -> copy Postgres document into public_docs
```

Result: Knowledge and content are detached. The RAG system doesn't know what's published; the CMS doesn't know what's been ingested.

### Knoxx's Solution: CMS as a View Layer

**CMS is a view and mutation layer over OpenPlanner, not a second database.**

```
CORRECT:
ingestion -> OpenPlanner documents/events
CMS -> reads and mutates OpenPlanner document metadata
publish/archive -> visibility changes inside OpenPlanner
widget/query -> search OpenPlanner with visibility filters
```

### Visibility State Machine

```
                ┌──────────┐
        ┌──────│ internal │──────┐
        │      └──────────┘      │
        │    POST /cms/draft      │  ai-drafted
        │    or POST /cms/create   │
        ▼                         ▼
 ┌──────────┐             ┌──────────┐
 │  review  │             │ internal │
 └──────────┘             │(ai-draft)│
   │                      └──────────┘
   │ POST /cms/publish
   ▼
 ┌──────────┐
 │  public  │◄──── visible to Layer 1 widget
 └──────────┘
   │
   │ POST /cms/archive
   ▼
 ┌──────────┐
 │ archived │──── hidden from all, recoverable
 └──────────┘
```

### CMS Features

**Document Editor** (`CmsPage.tsx`):

- File explorer integration (ContextBar)
- Markdown body editor
- Title editor
- Garden selector for publication
- Visibility status badges
- Save / Publish / Unpublish buttons
- Integrated chat workspace for AI assistance

**AI Draft Flow**:

```
POST /api/cms/draft
{
  "topic": "Our onboarding process",
  "tone": "professional",
  "audience": "prospects",
  "source_collections": ["devel_docs"],
  "max_context_chunks": 5
}
  │
  ├─ 1. Search source_collections via OpenPlanner federated search
  ├─ 2. Build prompt: topic + tone + audience + context chunks
  ├─ 3. Call Proxx with system prompt
  ├─ 4. Store draft in OpenPlanner with:
  │      visibility = 'internal'
  │      source = 'ai-drafted'
  └─ 5. Return document id for human review
```

**Garden Publication**:

- Gardens are curated knowledge spaces
- Publishing to a garden marks the document as public for that garden
- Gardens can have `target_languages` configured, triggering translation jobs
- Publication metadata stored in `extra.metadata.garden_publications`

### API Surface

| Endpoint | Purpose |
|----------|---------|
| `GET /api/cms/documents` | List docs, filter by visibility, domain, source |
| `GET /api/cms/documents/{id}` | Get single doc |
| `POST /api/cms/documents` | Create manual doc |
| `PATCH /api/cms/documents/{id}` | Update content, visibility, metadata |
| `DELETE /api/cms/documents/{id}` | Soft delete (set visibility=archived) |
| `POST /api/cms/draft` | AI-generate draft from topic + sources |
| `POST /api/cms/publish/{id}/{garden_id}` | Set visibility=public for garden |
| `DELETE /api/cms/publish/{id}/{garden_id}` | Unpublish from garden |
| `POST /api/cms/archive/{id}` | Pull from public |
| `GET /api/cms/stats` | Counts by visibility, domain |

### Problems Solved

| Problem | Knoxx Solution |
|---------|----------------|
| **Split truth**: CMS and knowledge base diverge | OpenPlanner is the single source of truth for both |
| **No AI assistance**: Manual authoring only | AI draft flow with grounded context from knowledge base |
| **Binary publish**: No review/approval workflow | Visibility state machine with review gate |
| **Garden blindness**: Documents published to void | Garden-targeted publication with per-garden metadata |
| **Translation disconnect**: Published docs not translated | Publish triggers translation jobs automatically |

---

## What Problems Does Knoxx Solve?

### 1. **The Knowledge Fragmentation Problem**

**Before**: Documents scattered across filesystems, wikis, codebases, chat history. No unified search. No relationships.

**Knoxx**: 
- Ingestion worker discovers and classifies files into lakes (`docs`, `code`, `config`, `data`)
- OpenPlanner stores with FTS + vector search
- Knowledge graph connects related concepts
- Single query interface across all sources

### 2. **The RAG Quality Problem**

**Before**: RAG systems are black boxes. You can't see what sources were retrieved, what chunks were used, or why an answer was generated.

**Knoxx**:
- Source attribution visible in UI
- Confidence scores exposed
- Provenance panel shows sources, agent contributions, corrections
- Human review workflow for synthesis outputs
- Correction write-back to memory graph

### 3. **The MT Feedback Loop Problem**

**Before**: Machine translations are used as-is. Errors compound. No mechanism to improve.

**Knoxx**:
- Human review with multi-dimensional labels
- Corrections captured and stored
- SFT export for fine-tuning
- Graph memory enrichment with approved examples
- Terminology consistency tracking

### 4. **The CMS/Knowledge Split Problem**

**Before**: CMS manages published content. Knowledge base manages ingested content. They never meet.

**Knoxx**:
- CMS is a view layer over the same OpenPlanner that stores ingested knowledge
- Publishing changes visibility metadata, not data location
- AI drafting uses knowledge base context
- Published content can be translated, reviewed, and improved

### 5. **The Local-First Sovereignty Problem**

**Before**: Cloud-only knowledge systems require internet, trust third parties with sensitive data, and disappear when the vendor shuts down.

**Knoxx**:
- Local-first architecture
- OpenAI-compatible endpoints for model flexibility
- Self-hosted vector search
- Data export capabilities
- No vendor lock-in

### 6. **The Operator Ex