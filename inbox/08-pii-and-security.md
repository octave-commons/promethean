# We need a protocol for handling PII

Yes — you need a **PII handling protocol** before you ship multi-tenant ingestion, translation, or training. The safest baseline is: classify PII up front, minimize collection, isolate it by tenant, encrypt it in transit and at rest, restrict access by role, prevent it from leaking into logs/training by default, and require review plus audit trails for any exception path.[^26_1][^26_2][^26_3]

## Scope

NIST’s Privacy Framework treats privacy as an enterprise risk management problem organized around Identify, Govern, Control, Communicate, and Protect functions, which is a good structure for your protocol.  OWASP’s guidance starts from the same place operationally: first classify what data is sensitive, then apply controls based on that classification.[^26_2][^26_3]

Use a simple internal policy label set:

- **PII-0**: no personal data.
- **PII-1**: basic identifiers, like name or business email.
- **PII-2**: sensitive personal data, like financial, health, legal, or government-linked identifiers.
- **PII-3**: regulated/high-risk data that requires explicit approval paths and tighter isolation.

That kind of classification-first approach is directly aligned with OWASP’s recommendation to classify data processed, stored, and transmitted, then apply controls according to sensitivity.[^26_2]

## Default protocol

1. **Collect the minimum necessary** for the workflow, because data you do not retain cannot be stolen.[^26_2]
2. **Tag all incoming data** at ingest with tenant ID, sensitivity class, source, retention policy, and whether it is allowed in prompts, logs, exports, or training.[^26_3][^26_2]
3. **Encrypt everything in transit and at rest**, using current strong protocols and proper key management.[^26_1][^26_2]
4. **Block unscoped access** so every read, search, export, or prompt assembly is explicitly tenant-scoped and role-checked.[^26_4][^26_2]
5. **Disable sensitive logging by default**, because OWASP specifically warns against unnecessary storage and exposure of private information.[^26_5][^26_2]
6. **Do not use raw PII for model training by default**; require explicit approval and a documented lawful/business basis before any PII enters fine-tuning datasets. That follows the Privacy Framework’s emphasis on governance, control, and communication around data processing risk.[^26_3]
7. **Apply retention and deletion rules** automatically, because minimization and controlled retention are core privacy controls.[^26_3][^26_2]

## System rules

For your stack, I would make these rules non-negotiable:

- **No raw PII in prompts unless required for the task**, and even then only the smallest needed fragment. That is a minimization control consistent with NIST’s privacy-risk approach and OWASP’s “don’t store sensitive data unnecessarily” principle.[^26_2][^26_3]
- **No PII in debug logs, traces, analytics, or exception dumps**. Sensitive responses should avoid caching, and private values should be masked or tokenized before logging.[^26_6][^26_2]
- **No cross-tenant embeddings or shared training corpora containing customer PII**. Tenant separation has to apply to documents, queries, logs, and review exports, not just the UI.[^26_4][^26_2]
- **No automatic publication of translated sensitive content** without policy checks and, for higher-risk categories, human review. That fits the human-review pattern used for higher-risk translation and support workflows.[^26_7][^26_3]
- **All access must be least-privilege** and auditable, because privacy-preserving access depends on strong identity management, role-based access control, and continuous monitoring.[^26_8][^26_3]


## Operational workflow

Here is the protocol in lifecycle form:


| Stage | Required action |
| :-- | :-- |
| Ingest | Detect and classify PII, attach `tenant_id`, sensitivity, retention rule, and usage flags before storage. [^26_2][^26_3] |
| Storage | Encrypt at rest, separate by tenant, and restrict access by role and policy. [^26_2][^26_4][^26_1] |
| Retrieval | Filter by tenant and authorization before any generation step begins. [^26_4] |
| Generation | Redact or minimize PII in prompts unless strictly needed for the response. [^26_2][^26_3] |
| Translation | Run glossary/risk checks; route sensitive or low-confidence content to review. [^26_7][^26_9] |
| Logging | Mask or suppress PII; never cache sensitive responses casually. [^26_2][^26_6] |
| Training | Exclude raw PII by default; require approval, traceability, and retention limits for any exception. [^26_3][^26_2] |
| Deletion | Enforce retention windows and verified deletion/export procedures. [^26_3] |

## Incident rules

You also need a simple breach/escalation protocol. NIST’s Privacy Framework explicitly includes communication and protection functions for privacy events, so your protocol should define what happens when PII is exposed, over-retained, misrouted, or used in training without authorization.[^26_3]

Minimum incident steps:

- Freeze affected pipelines or exports immediately.[^26_3]
- Identify affected tenant, records, systems, and logs.[^26_4][^26_3]
- Revoke exposed credentials or tokens and rotate keys if needed. Proper key management is part of OWASP’s minimum controls.[^26_2]
- Preserve audit evidence and notify internal owners through a defined chain.[^26_3]
- Remove or quarantine affected data from prompts, stores, caches, and training datasets.[^26_6][^26_2]


## Policy language

A clean internal policy statement could be:

> “Personal data must be classified at ingestion, isolated by tenant, encrypted in transit and at rest, access-controlled by least privilege, excluded from logs and training by default, and retained only as long as required for the approved business purpose.”[^26_1][^26_2][^26_3]

That is the protocol you can actually build into the platform. The next useful move is turning this into three concrete artifacts: **data classification rules, engineering guardrails, and an incident runbook**.
<span style="display:none">[^26_10][^26_11][^26_12][^26_13][^26_14][^26_15][^26_16][^26_17][^26_18]</span>

<div align="center">⁂</div>

[^26_1]: https://csrc.nist.gov/pubs/sp/800/171/r3/final

[^26_2]: https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure

[^26_3]: https://www.nist.gov/document/nist-privacy-frameworkv10pdf

[^26_4]: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/secure-multitenant-rag

[^26_5]: https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html

[^26_6]: https://www.apisec.ai/blog/sensitive-data-exposure

[^26_7]: https://aws.amazon.com/blogs/machine-learning/designing-human-review-workflows-with-amazon-translate-and-amazon-augmented-ai/

[^26_8]: https://hoop.dev/blog/privacy-preserving-data-access-with-the-nist-cybersecurity-framework/

[^26_9]: https://www.machinetranslation.com/blog/introducing-mt-human-review

[^26_10]: https://www.johansonllp.com/blog/what-is-nist-800-171

[^26_11]: https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final

[^26_12]: https://industrialcyber.co/nist/nist-releases-finalized-security-guidelines-for-controlled-unclassified-information-in-sp-800-171r3-sp-800-171ar3/

[^26_13]: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-172.pdf

[^26_14]: https://www.kelsercorp.com/blog/nist-800-171-rev-3-update-protecting-cui

[^26_15]: https://riskonnect.com/compliance/the-nist-privacy-framework-what-is-it-and-why-it-matters/

[^26_16]: https://www.gsa.gov/system/files/Protecting-Controlled-Unclassified-Information-(CUI)-in-Nonfederal-Systems-and-Organizations-Process-[CIO-IT-Security-21-112-Rev-1].pdf

[^26_17]: https://www.indusface.com/blog/sensitive-data-exposure-nightmare-business-enterprises/

[^26_18]: https://dodprocurementtoolbox.com/uploads/NIST_SP_800_171a_334eebdb2c.pdf


---

# [https://github.com/HHS/TANF-app](https://github.com/HHS/TANF-app) I worked on this a few years ago, and we had to be very careful about PII, let me know what patterns we should borrow here.

In fact we... could imagine this all as... like... we could... where am I going?

Good, I've got a solid read on the whole codebase now. Here's what TANF-app actually built and how to transplant those patterns into your platform.

***

## What TANF-app got right

TANF-app is a genuinely well-engineered federal app handling welfare case data — actual SSNs, income info, case identifiers for real families. The patterns baked in are field-tested under ATO (Authority to Operate) scrutiny. Here's what it actually does, pulled straight from the source.

### SHA-256 integrity on every file, always

[`get_file_shasum()`](https://github.com/HHS/TANF-app/blob/e8384e9e16f71b11ac1428b4912e7c2e63d2f5cf/tdrs-backend/tdpservice/data_files/models.py) computes a SHA-256 checksum of every uploaded file before it ever touches the database or storage.  That hash is stored alongside the file record. This is the pattern you want on **every document ingested** into your knowledge base. You get: tamper detection, deduplication, and a foundation for audit trails that can prove what was stored and when.

```python
# Borrow this directly
def get_file_shasum(file: Union[File, StringIO]) -> str:
    _hash = sha256()
    # handles chunked reads for large files
    # resets seek(0) after so the file is reusable
```

Transplant this as an `ingest_guard` step that runs before the document hits the vector store or blob storage.

### Virus scan before storage, not after

Every file upload goes through **ClamAV** first, and the scan result is recorded as a first-class model (`ClamAVFileScan`) with a `LogEntry` tied to it before the file is accepted.  The result enum is `CLEAN | INFECTED | ERROR` — nothing INFECTED or ERROR ever proceeds.

```python
class ClamAVFileScan(models.Model):
    file_name, file_size, file_shasum, result, uploaded_by, data_file
```

For your platform: every document ingested by a tenant goes through a malware gate. The scan record links `tenant_id`, `uploaded_by`, `file_shasum`, and `result`. If infected or error, the file is quarantined and the tenant's ingest queue is blocked until resolved.

### Django `LogEntry` on every security-relevant action

Both `ClamAVFileScanManager.record_scan()` and `LegacyFileTransferManager.record_scan()` call `LogEntry.objects.log_action()` immediately after creating the record.  This means every AV scan, every file transfer, and every status change has a tamper-evident, timestamped, user-attributed log entry in Django's built-in audit log.

```python
LogEntry.objects.log_action(
    user_id=uploaded_by.pk,
    content_type_id=content_type.pk,
    object_id=av_scan.pk,
    action_flag=ADDITION,
    change_message=msg,
)
```

Transplant this as your **PII access audit trail**: every time a document containing PII-tagged content is retrieved, reviewed, exported, or used in a training export, you create a `LogEntry`-style record with `user_id`, `tenant_id`, `object_id`, `action`, and `timestamp`. That is your compliance paper trail.

### RISC/OpenID security event tokens for identity-level events

The `SecurityEventToken` model + `SecurityEventType` enum ingests **RISC events from Login.gov** — account disabled, purged, password reset, MFA locked, email changed, etc. — and stores them as JWT-sourced records linked to the user.  This is how they handle "we just found out this user's identity was compromised" without relying on the user to self-report.

```python
class SecurityEventType(models.TextChoices):
    ACCOUNT_DISABLED = "https://schemas.openid.net/secevent/risc/event-type/account-disabled"
    ACCOUNT_PURGED   = "..."
    PASSWORD_RESET   = "..."
    # etc.
```

For your platform, the equivalent is: when your SSO/OIDC provider sends a security event (password reset, account purge, MFA change), you **immediately revoke active sessions and pending review assignments** for that user across all tenants they touch. You need a `SecurityEventToken`-equivalent model per user so these events are stored and acted on, not just logged.

### S3 versioned storage with isolated prefixes per entity

[`get_s3_upload_path()`](https://github.com/HHS/TANF-app/blob/e8384e9e16f71b11ac1428b4912e7c2e63d2f5cf/tdrs-backend/tdpservice/data_files/models.py) constructs paths as `data_files/{year}/{quarter}/{stt_id}/{program_type}/{section}/`.  That means access policies, lifecycle rules, and deletion are all scoped to identifiable prefixes rather than flat namespaces. `S3VersionedFileField` gives you object-level versioning so you can prove what was stored at any point in time.

For your platform: paths should be `kb/{tenant_id}/{domain}/{doc_id}/` so that S3 bucket policies, KMS key policies, and lifecycle rules can be applied per-tenant with zero ambiguity.

### OWASP ZAP scanning baked into CI

`OwaspZapScan` records the results of nightly automated penetration tests against both backend and frontend.  These aren't just for show — the model has `fail_count`, `warn_count`, `pass_count`, and a `result` property that gates success. A system user is created for CI-triggered scans so audit trails remain intact even without a human actor.

***

## The pattern I think you were about to say

The half-formed thought you were chasing is probably this:

> **TANF-app is essentially a multi-agency knowledge ingestion and reporting platform for sensitive government data, with access boundaries by agency ("STT"), document type ("section"), and user role. Your Futuresight platform is the same shape — just with corporate tenants instead of states, documents instead of flat files, and LLM generation instead of batch reporting.**

The isomorphism is tight:


| TANF-app concept | Your platform equivalent |
| :-- | :-- |
| STT (State/Tribe/Territory) | Tenant |
| `DataFile` with `stt` + `section` + `program_type` FK | `Document` with `tenant_id` + `domain` + `doc_type` FK |
| ClamAV scan before storage | Malware + PII detection scan before ingest |
| `get_file_shasum` on ingest | SHA-256 integrity check on every ingested document chunk |
| `LogEntry` on every action | PII access audit log on every retrieval, review, export |
| RISC security event tokens | OIDC/RISC events → revoke sessions + review queue access |
| S3 prefix per STT/section | S3 (or vector namespace) prefix per `tenant_id/domain` |
| OWASP ZAP in CI | Automated security scanning in your deployment pipeline |

The entire security posture of TANF-app is: **classify, isolate by entity boundary, hash everything, scan before storage, log every action against every object, and subscribe to identity-level security events.** That is exactly what you need to borrow, verbatim, and extend with the AI-specific layer (PII in prompts, PII in training exports, translation review).

Finish the thought — what were you about to say about imagining the whole thing as something?

