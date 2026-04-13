# Yeap write it up

Absolutely — here’s the **board-ready version** of the work, written to match the FSM / kanban rules you laid out.

## Epic

**Domain-Aware Knowledge Ops Platform**

A multi-tenant system that ingests client knowledge, controls PII, translates content, routes uncertain outputs to expert review, and exports labeled examples for model improvement.

## Card format

Use this structure on every task card:

- **Title**
- **Outcome**
- **Acceptance criteria**
- **Open questions / risks**
- **Complexity score**
- **State**

***

## Card 1: Tenant context resolution

**Outcome**
Every request resolves to exactly one tenant before any data access or write occurs.

**Acceptance criteria**

- Authenticated requests resolve a tenant ID.
- Requests without tenant context fail closed.
- Downstream services receive tenant context automatically.
- Cross-tenant access is denied.

**Open questions / risks**

- How tenant context is derived: subdomain, header, token claim, or session.
- Whether unauthenticated preflight traffic needs special handling.

**Complexity score**
3

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 2: Tenant workspace creation

**Outcome**
Operators can create and suspend tenant workspaces.

**Acceptance criteria**

- Tenant records can be created.
- Tenant records include name, status, default language, and policy profile.
- Suspended tenants cannot create new activity.
- Tenant lifecycle actions are logged.

**Open questions / risks**

- Who is allowed to create tenants.
- Whether tenant creation is self-service or operator-only.

**Complexity score**
3

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 3: Role model and access control

**Outcome**
Users receive scoped roles within a tenant and can only do what their role permits.

**Acceptance criteria**

- Roles exist for admin, reviewer, end user, and operator.
- Tenant admins can assign roles within their tenant only.
- Protected endpoints enforce role checks.
- Denied access is logged.

**Open questions / risks**

- Whether role inheritance is needed.
- Whether per-document overrides exist in MVP.

**Complexity score**
5

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 4: File ingest API

**Outcome**
Tenant users can upload approved documents into the platform.

**Acceptance criteria**

- Upload endpoint accepts approved file types.
- Each upload stores tenant ID, source, uploader, and document type.
- Invalid uploads are rejected with clear errors.
- Upload attempts are logged.

**Open questions / risks**

- Which file types are allowed in MVP.
- Whether uploads can be synchronous or must be async.

**Complexity score**
5

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 5: File hashing on ingest

**Outcome**
Every uploaded file is hashed before acceptance.

**Acceptance criteria**

- Every accepted file gets a SHA-256 hash.
- Hash is stored with the document record.
- Duplicate hashes are detectable.
- Hashing failures block ingest completion.

**Open questions / risks**

- How deduplication should behave when identical files come from different sources.

**Complexity score**
2

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 6: Malware scanning and quarantine

**Outcome**
Unsafe uploads are blocked before storage or indexing.

**Acceptance criteria**

- Files are scanned before acceptance.
- Scan results are stored as clean, infected, or error.
- Infected or failed scans quarantine the file.
- Quarantined files do not enter retrieval or indexing.
- Scan events are logged.

**Open questions / risks**

- Scanner integration details.
- How to handle scanner downtime.

**Complexity score**
8

**State**
Incoming → Accepted → Breakdown
**Note:** This needs further refinement before implementation.

***

## Card 7: PII classification pipeline

**Outcome**
Ingested content is scanned for PII and tagged with sensitivity metadata.

**Acceptance criteria**

- Content is scanned after clean ingest.
- PII findings are stored in structured form.
- Each document receives a sensitivity label.
- Classification failures prevent release to downstream steps.

**Open questions / risks**

- What PII classes are in scope.
- Whether structured and unstructured content use the same detector path.

**Complexity score**
8

**State**
Incoming → Accepted → Breakdown
**Note:** Split before implementation.

***

## Card 8: Redacted preview generation

**Outcome**
Users can inspect safe previews without exposing raw sensitive data.

**Acceptance criteria**

- Redacted preview can be generated for PII-bearing files.
- Sensitive spans are masked.
- Redacted preview differs from the raw original.
- Preview generation is logged.

**Open questions / risks**

- How redaction should behave on tables, PDFs, and images.

**Complexity score**
5

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 9: Tenant-scoped object storage

**Outcome**
Documents are stored in tenant-scoped locations.

**Acceptance criteria**

- Accepted files use tenant-scoped storage prefixes.
- Storage metadata includes tenant ID and document ID.
- Quarantined files use a separate protected prefix.
- Storage rules are documented and tested.

**Open questions / risks**

- Prefix strategy if multiple storage backends are used later.

**Complexity score**
3

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 10: Chunking and indexing pipeline

**Outcome**
Accepted documents become searchable chunks.

**Acceptance criteria**

- Non-quarantined documents are chunked.
- Chunks retain tenant ID, document ID, source, and sensitivity.
- Failed chunking is recorded as a document state.
- Re-indexing can be triggered safely.

**Open questions / risks**

- Chunk size policy.
- Whether parsing is document-type specific.

**Complexity score**
8

**State**
Incoming → Accepted → Breakdown
**Note:** Needs splitting.

***

## Card 11: Tenant-scoped search API

**Outcome**
Users can search only within their own tenant.

**Acceptance criteria**

- Search returns only tenant-owned documents.
- Search excludes quarantined and unauthorized content.
- Results are relevance ordered.
- Queries and result metadata are auditable.

**Open questions / risks**

- Whether keyword search and semantic search ship together or separately.

**Complexity score**
5

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 12: Retrieval filters

**Outcome**
Users can narrow results by domain, document type, and sensitivity.

**Acceptance criteria**

- Domain filter works.
- Document type filter works.
- Sensitivity filter works where permissions allow.
- Invalid filters return clear errors.

**Open questions / risks**

- Whether filter combinations need a strict precedence model.

**Complexity score**
2

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 13: Source citation payload

**Outcome**
Search results show source references that can be traced back.

**Acceptance criteria**

- Results include title, source, and chunk reference.
- Citations resolve to origin documents.
- Cross-tenant metadata is never exposed.
- Citation fields are consistent.

**Open questions / risks**

- Whether citations need a UI display format in MVP.

**Complexity score**
2

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 14: Translation workflow

**Outcome**
Content can be translated into tenant-approved languages and routed for review when needed.

**Acceptance criteria**

- Source language is detected.
- Target language is configurable.
- Translation confidence is stored.
- Low-confidence or sensitive translations route to review.
- Tenant glossary support is available or explicitly deferred.

**Open questions / risks**

- Whether machine translation is external or internal.
- How glossary enforcement is measured.

**Complexity score**
8

**State**
Incoming → Accepted → Breakdown
**Note:** Split before implementation.

***

## Card 15: Expert review queue

**Outcome**
SMEs can review, approve, reject, or edit generated outputs.

**Acceptance criteria**

- Review items appear in a queue.
- Reviewers can approve, reject, or edit outputs.
- Review status is tracked.
- Review comments are stored structurally.
- Review actions are auditable.

**Open questions / risks**

- Reviewer assignment logic.
- Whether review is by tenant or by domain.

**Complexity score**
5

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 16: Training data export

**Outcome**
Reviewed examples can be exported as model-improvement data.

**Acceptance criteria**

- Approved reviews can be exported.
- Exports include source, output, correction, reviewer, and timestamp.
- Raw PII is excluded by default.
- Export lineage is preserved.

**Open questions / risks**

- What exact export schema downstream training expects.

**Complexity score**
5

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 17: Audit event schema

**Outcome**
Every important action can be traced consistently.

**Acceptance criteria**

- Audit events store tenant ID, actor ID, object type, object ID, action, outcome, and timestamp.
- Audit events support metadata without raw PII by default.
- Schema is reusable across services.
- Event writes fail safely.

**Open questions / risks**

- Whether audit storage is app DB, log stream, or separate store.

**Complexity score**
3

**State**
Incoming → Accepted → Breakdown → Ready

***

## Card 18: Ingest and retrieval event logging

**Outcome**
Security-relevant activity is captured in the audit trail.

**Acceptance criteria**

- Upload, scan, quarantine, classify, index, search, and view actions emit audit events.
- Denied actions are logged.
- Audit events are tenant-scoped.
- Logs avoid raw sensitive content.

**Open questions / risks**

- Log volume and retention policy.

**Complexity score**
8

**State**
Incoming → Accepted → Breakdown
**Note:** Needs smaller slices.

***

## Card 19: Admin action logging

**Outcome**
Configuration and policy changes are auditable.

**Acceptance criteria**

- Tenant creation, suspension, role changes, and overrides are logged.
- Actor identity and reason are recorded where applicable.
- Admin audit events are queryable.
- Missing actor context fails closed.

**Open questions / risks**

- Whether all admin actions require a reason field.

**Complexity score**
3

**State**
Incoming → Accepted → Breakdown → Ready

***

## Suggested ready queue

These are the cards that look **eligible to implement** once they are moved into Ready:

- Tenant context resolution.
- Tenant workspace creation.
- Role model and access control.
- File ingest API.
- File hashing on ingest.
- Redacted preview generation.
- Tenant-scoped object storage.
- Tenant-scoped search API.
- Retrieval filters.
- Source citation payload.
- Expert review queue.
- Training data export.
- Audit event schema.
- Admin action logging.

These are the cards that should **go back to breakdown** before implementation:

- Malware scanning and quarantine.
- PII classification pipeline.
- Chunking and indexing pipeline.
- Translation workflow.
- Ingest and retrieval event logging.


## What the board should say

For each task, the card should contain:

- **What slice is being delivered**
- **Why it matters**
- **What done means**
- **What is risky or unknown**
- **The Fibonacci score**
- **The current column**

That keeps the board as the source of truth and prevents off-board drift.

If you want, I can next turn this into a **literal Jira-style backlog export**, or I can take the next step and **split the 8-point cards into 3- and 5-point implementable slices**.

