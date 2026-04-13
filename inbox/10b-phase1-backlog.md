# Lets go

Yep — here’s **Phase 1** rewritten as a backlog in relative estimation terms, not calendar promises. Story points are meant to represent relative effort, complexity, and uncertainty rather than hours, while acceptance criteria define what must be true for a story to count as complete.[^34_1][^34_2]

## Sizing rules

Use this scale for refinement:


| Points | Meaning | Typical shape |
| :-- | :-- | :-- |
| 1 | Tiny | Low risk, obvious implementation |
| 2 | Small | Simple extension of existing pattern |
| 3 | Moderate | Some integration or validation logic |
| 5 | Significant | Multiple moving parts, normal uncertainty |
| 8 | Large | Cross-cutting work, meaningful unknowns |
| 13 | Too big | Should usually be split before commitment |

Use acceptance criteria as the “what done looks like” line, and keep technical tasks underneath each story rather than mixing them into the story itself.[^34_3][^34_1]

## Phase 1 epics

| Epic | Goal | Total points |
| :-- | --: | --: |
| Tenant foundation | Make every request, object, and permission tenant-aware | 21 |
| Secure ingestion | Accept files safely and track them end-to-end | 31 |
| PII controls | Detect, tag, and constrain sensitive content | 26 |
| Retrieval v1 | Make tenant-scoped knowledge searchable | 24 |
| Audit trail | Log all security-relevant actions | 19 |

## Tenant foundation

### Story: Tenant model and workspace creation

**As** a platform operator, **I want** to create a tenant workspace, **so that** each client has a distinct boundary.

- Points: 5
- Complexity drivers: Core data model, admin bootstrap, object ownership rules
- Acceptance criteria:
- A tenant record can be created with name, status, policy profile, and default language settings.
- New tenants receive a unique tenant ID.
- Tenant creation is logged.
- Suspended tenants cannot create new activity.


### Story: Tenant context resolution

**As** the platform, **I want** every request to resolve to a tenant context, **so that** no operation runs without an isolation boundary.

- Points: 5
- Complexity drivers: Middleware, auth/session integration, failure handling
- Acceptance criteria:
- Every authenticated request resolves a tenant ID.
- Requests without valid tenant context fail closed.
- Tenant context is available to downstream services.
- Cross-tenant object access is rejected.


### Story: Role model and tenant admin bootstrap

**As** a tenant admin, **I want** scoped roles inside my workspace, **so that** people only get the access they need.

- Points: 5
- Complexity drivers: RBAC structure, admin assignment, permission checks
- Acceptance criteria:
- Roles exist for tenant admin, reviewer, end user, and operator.
- Tenant admins can invite and assign users within their tenant only.
- Role checks are enforced on protected endpoints.
- Permission denials are logged.


### Story: Tenant suspension

**As** a platform operator, **I want** to suspend a tenant, **so that** I can immediately stop access during incidents.

- Points: 3
- Complexity drivers: State propagation, request blocking
- Acceptance criteria:
- Suspended tenants cannot log in, ingest, search, or export.
- Existing sessions are invalidated.
- Suspension reason is recorded.
- Suspension events appear in audit logs.


### Story: Isolation test suite

**As** an engineer, **I want** automated tenant-isolation tests, **so that** regressions are caught early.

- Points: 3
- Complexity drivers: Test fixtures, negative-path coverage
- Acceptance criteria:
- Tests prove cross-tenant reads are blocked.
- Tests prove cross-tenant writes are blocked.
- Tests cover both API and service-layer access.
- Tests run in CI.


## Secure ingestion

### Story: File ingest API

**As** a tenant admin, **I want** to upload documents into the platform, **so that** the knowledge base can be built from approved content.

- Points: 5
- Complexity drivers: API shape, metadata validation, storage handoff
- Acceptance criteria:
- Upload endpoint accepts approved file types.
- Each upload records tenant ID, source, uploader, and document type.
- Invalid files are rejected with actionable errors.
- Upload attempts are logged.


### Story: Content hashing on ingest

**As** the platform, **I want** every file hashed at ingest, **so that** integrity and deduplication checks are possible.

- Points: 3
- Complexity drivers: Large-file handling, metadata persistence
- Acceptance criteria:
- Every accepted file gets a SHA-256 checksum.
- Hash is stored with the document record.
- Duplicate hash events are detectable.
- Hashing failures prevent ingest completion.


### Story: Malware scanning and quarantine

**As** the platform, **I want** uploaded files scanned before acceptance, **so that** unsafe content never enters normal storage or indexing.

- Points: 8
- Complexity drivers: Scanner integration, async workflow, quarantine path
- Acceptance criteria:
- Files are scanned before they are marked accepted.
- Clean, infected, and error states are persisted.
- Infected or scan-error files are quarantined.
- Quarantined files are excluded from retrieval and indexing.
- Scan results are logged with uploader and tenant context.


### Story: Tenant-scoped object storage layout

**As** an operator, **I want** storage paths scoped by tenant, **so that** lifecycle controls and access rules are enforceable.

- Points: 5
- Complexity drivers: Naming conventions, storage policy alignment
- Acceptance criteria:
- Accepted files are written to tenant-scoped prefixes.
- Storage metadata includes tenant ID and document ID.
- Quarantined files use a separate protected prefix.
- Storage path rules are documented and tested.


### Story: Ingest status lifecycle

**As** a tenant admin, **I want** to see ingest state, **so that** I know whether a document is pending, accepted, quarantined, or failed.

- Points: 5
- Complexity drivers: State machine, error handling, surfacing status
- Acceptance criteria:
- Documents move through explicit ingest states.
- Failures preserve error reason.
- Accepted files are ready for downstream classification.
- State changes are auditable.


### Story: Source registry

**As** a tenant admin, **I want** uploads tied to a declared source, **so that** provenance is preserved.

- Points: 5
- Complexity drivers: Source taxonomy, metadata consistency
- Acceptance criteria:
- Documents can be associated with a source type and source identifier.
- Manual uploads are labeled as manual.
- Source metadata is queryable later.
- Source assignment is mandatory before indexing.


## PII controls

### Story: PII classification pipeline

**As** the platform, **I want** ingested content scanned for PII, **so that** downstream controls can enforce sensitivity rules.

- Points: 8
- Complexity drivers: Detection quality, structured output, false positives
- Acceptance criteria:
- Content is scanned after clean ingest and before indexing.
- PII findings are stored in structured form.
- Each document receives a sensitivity level.
- Classification failures block downstream release until retried or overridden.


### Story: Sensitivity tagging schema

**As** an operator, **I want** standardized sensitivity labels, **so that** policies can be applied consistently.

- Points: 3
- Complexity drivers: Taxonomy design, policy alignment
- Acceptance criteria:
- Labels exist for no known PII, low sensitivity, restricted, and high sensitivity.
- Labels are attached to documents and available to retrieval filters.
- Label changes are versioned.
- Overrides require actor identity and reason.


### Story: Redacted preview generation

**As** a reviewer or admin, **I want** a redacted document preview, **so that** I can inspect content without exposing unnecessary PII.

- Points: 5
- Complexity drivers: Masking logic, render fidelity
- Acceptance criteria:
- The platform can generate a redacted preview for PII-bearing files.
- Redacted previews mask detected sensitive spans.
- Redacted previews are distinct from raw originals.
- Preview generation is logged.


### Story: Log scrubbing

**As** a compliance lead, **I want** logs scrubbed of raw PII by default, **so that** operational systems do not become a leakage path.

- Points: 5
- Complexity drivers: Cross-service consistency, edge-case strings
- Acceptance criteria:
- Raw PII is not written to application logs by default.
- Errors and exceptions use redacted representations.
- Logging helpers are centralized.
- Tests verify common sensitive fields do not appear in logs.


### Story: Sensitive-content access gating

**As** a tenant admin, **I want** access gates on restricted content, **so that** only authorized roles can view raw sensitive material.

- Points: 5
- Complexity drivers: Permission model, UX for denial paths
- Acceptance criteria:
- Restricted documents require explicit role permission for raw access.
- Users without permission see only redacted views or metadata.
- Access attempts are logged whether allowed or denied.
- Policy behavior is tenant-aware.


## Retrieval v1

### Story: Chunking and indexing pipeline

**As** the platform, **I want** accepted documents transformed into searchable chunks, **so that** tenant knowledge can be retrieved efficiently.

- Points: 8
- Complexity drivers: Parsing variability, indexing job flow, metadata preservation
- Acceptance criteria:
- Accepted non-quarantined files are chunked into indexable units.
- Each chunk retains tenant ID, document ID, source, and sensitivity label.
- Failed chunking is visible as a document state.
- Re-indexing can be triggered safely.


### Story: Tenant-scoped search API

**As** an end user, **I want** to search within my tenant’s knowledge, **so that** I can find relevant internal information.

- Points: 5
- Complexity drivers: Query interface, tenant filters, auth integration
- Acceptance criteria:
- Search only returns documents from the active tenant.
- Search excludes quarantined and unauthorized documents.
- Results are sorted by relevance.
- Queries and result metadata are auditable.


### Story: Retrieval filters

**As** a knowledge manager, **I want** to filter results by domain, document type, and sensitivity, **so that** searches are more precise.

- Points: 3
- Complexity drivers: Metadata model, filter composition
- Acceptance criteria:
- Search supports domain filter.
- Search supports document type filter.
- Search supports sensitivity filter where user permissions allow it.
- Invalid filters return clear errors.


### Story: Source citation payload

**As** an end user, **I want** search results to show source references, **so that** I can verify where information came from.

- Points: 3
- Complexity drivers: Response model, citation formatting
- Acceptance criteria:
- Result payload includes document title, source, and chunk reference.
- Citations resolve back to the originating document.
- Results never expose another tenant’s metadata.
- Citation fields are consistent across endpoints.


### Story: Permission enforcement on retrieval

**As** a security reviewer, **I want** retrieval to respect document permissions and sensitivity, **so that** search cannot bypass policy.

- Points: 5
- Complexity drivers: Policy evaluation on query path
- Acceptance criteria:
- Unauthorized documents are omitted from results.
- Restricted raw documents are not returned to unauthorized users.
- Permission checks occur server-side.
- Automated tests cover mixed-permission result sets.


## Audit trail

### Story: Audit event schema

**As** an operator, **I want** a standard audit event model, **so that** all key actions can be traced consistently.

- Points: 3
- Complexity drivers: Event taxonomy, reusable interfaces
- Acceptance criteria:
- Audit events store tenant ID, actor ID, object type, object ID, action, outcome, and timestamp.
- Events support metadata without exposing raw PII by default.
- Schema is reusable across services.
- Event writes fail safely.


### Story: Ingest and retrieval event logging

**As** a compliance lead, **I want** ingest and retrieval actions recorded, **so that** I can reconstruct who touched what.

- Points: 8
- Complexity drivers: Cross-cutting instrumentation, noise control
- Acceptance criteria:
- Upload, scan, quarantine, classify, index, search, and view actions emit audit events.
- Denied actions are logged.
- Audit events are tenant-scoped.
- Logs avoid raw sensitive content.


### Story: Admin action logging

**As** a security reviewer, **I want** admin changes logged, **so that** configuration and policy drift are visible.

- Points: 3
- Complexity drivers: Coverage of admin surfaces
- Acceptance criteria:
- Tenant creation, suspension, role changes, and policy overrides are logged.
- Actor identity and reason are recorded where applicable.
- Admin audit events are queryable.
- Missing actor context fails closed.


### Story: Minimal audit query surface

**As** an operator, **I want** a basic way to query audit events, **so that** I can investigate issues without direct database access.

- Points: 5
- Complexity drivers: Filtering, permissions, usability
- Acceptance criteria:
- Audit events can be filtered by tenant, actor, action, and date range.
- Non-operators cannot query outside their scope.
- Results are paginated.
- Sensitive metadata remains redacted unless authorized.


## Backlog shape

Here’s the recommended build order in backlog terms, not schedule terms:

1. Tenant foundation
2. Secure ingestion
3. PII controls
4. Retrieval v1
5. Audit trail

That order keeps you from building search on top of untrusted ingest, and it keeps you from shipping useful retrieval before you can explain who accessed what.

## Split candidates

These are the stories most likely to blow up and should be refined aggressively before commitment:

- Malware scanning and quarantine
- PII classification pipeline
- Chunking and indexing pipeline
- Ingest and retrieval event logging

If your team wants a stricter backlog, split each of those into:

- integration story
- persistence story
- policy/enforcement story
- test story

Next move: I can turn this into either a **Jira-import-friendly backlog**, or a **technical architecture spec** with services, tables, APIs, and event flows.
<span style="display:none">[^34_4][^34_5][^34_6][^34_7][^34_8]</span>

<div align="center">⁂</div>

[^34_1]: https://www.atlassian.com/work-management/project-management/acceptance-criteria

[^34_2]: https://asana.com/resources/story-points

[^34_3]: https://resources.scrumalliance.org/Article/need-know-acceptance-criteria

[^34_4]: https://www.easyagile.com/blog/how-to-write-good-user-stories-in-agile-software-development

[^34_5]: https://www.nngroup.com/articles/ux-user-stories/

[^34_6]: https://www.mountaingoatsoftware.com/blog/short-answers-to-your-big-questions-about-user-stories

[^34_7]: https://www.scrum.org/forum/scrum-forum/94804/what-best-practices-writing-user-stories-how-many-acceptance-criteria-should-normally-maximal-user-story-have

[^34_8]: https://www.reddit.com/r/scrum/comments/1fi4mjf/should_acceptance_criteria_be_written_before_or/

