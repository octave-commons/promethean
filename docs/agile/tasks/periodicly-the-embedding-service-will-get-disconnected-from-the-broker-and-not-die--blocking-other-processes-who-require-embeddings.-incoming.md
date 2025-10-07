---
```
uuid: 9926dde4-990e-4503-a057-fcae2e5bf1b1
```
```
title: >-
```
  Embedding service sometimes disconnects from broker and hangs → detect, shed,
  kill, recover
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.518Z'
```
---
Here’s a surgical expansion you can drop into the board. Goal: make the **embedding service** fail fast, get killed when it’s unhealthy, and stop blocking dependents. No vibes—just guards, telemetry, and hard interlocks.

# Embedding service sometimes disconnects from broker and hangs → detect, shed, kill, recover
```
**Owner:** Codex / Agent
```
```
**Status:** Planned
```
**Labels:** #embeddings #broker #heartbeat #healthchecks #overload #resilience #promethean

---

## 🛠️ Problem recap (plain)

Periodically the **embedding** service loses its broker connection and doesn’t die. It keeps the process “alive” enough to dodge current liveness checks, which **blocks requesters** that require embeddings. You suspect overload. If the heartbeat service worked end-to-end, it should have killed it; it didn’t.

---

## 🎯 Outcomes

* The embedding service **refuses work** under overload (admission control) instead of zombifying.
* When **broker connectivity is lost** or the **work loop stalls**, the service **exits** SIGTERM → SIGKILL quickly.
* The **heartbeat** reliably detects unresponsive or disconnected state and kills the process within the configured window.
* We have **metrics, logs, and repro** (chaos test) that prove this.

---

## 📦 Requirements / Definition of Done non-negotiable

* [ ] **Explicit liveness** and **readiness** semantics:

  * Liveness: event loop + worker pool making forward progress in the last `LIVENESS_MAX_STALL_MS`.
  * Readiness: **broker connected** AND **model ready** AND **queue < MAX\_QUEUE**.
* [ ] **Broker-aware watchdog**: if `broker.disconnected_for > DISCONNECT_KILL_MS` → `process.exit(70)` (distinct code).
* [ ] **Admission control**: reject new jobs once `inflight + queue ≥ MAX_QUEUE`, emit backpressure signal + metrics.
* [ ] **Heartbeat** enriched:

  * Sends `connected: true|false`, `queue_depth`, `inflight`, `last_job_latency_ms`, `last_progress_ts`.
  * Server enforces kill if `now - last_progress_ts > HEARTBEAT_TIMEOUT` OR `connected=false for > DISCONNECT_KILL_MS`.
* [ ] **Graceful shutdown**: stop intake, drain for `DRAIN_MS`, then hard exit if still busy.
* [ ] **Chaos test** that severs broker and floods load → process is killed/restarted; dependents observe fail-fast (not hang).
* [ ] **Alarms** on repeating death loops >N restarts / 10 min with log hint to raise capacity or lower concurrency.
* [ ] **Docs** with clear thresholds and how to tune them.

---

## 📋 Tasks

### Step 1 — Instrument & define health truth

* [ ] Add **progress ticker** in the embed loop: update `last_progress_ts` whenever a batch completes (success or error).
* [ ] Implement **readiness** and **liveness** endpoints (HTTP or broker health topic):

  * `/health/ready` returns 200 only if `{ broker: connected, model: ready, queue < MAX_QUEUE }`.
  * `/health/live` returns 200 only if `now - last_progress_ts < LIVENESS_MAX_STALL_MS`.
* [ ] Extend **HeartbeatClient** payload (you already have it) to include:

  ```json
  {
    "pid": 1234,
    "name": "embeddings",
    "connected": true,
    "queue": 42,
    "inflight": 8,
    "last_progress_ts": 1724612345678,
    "avg_job_ms": 37
  }
  ```
* [ ] Update heartbeat server policy:

  * If `connected=false` continuously for `DISCONNECT_KILL_MS`, kill.
  * If `now - last_progress_ts > HEARTBEAT_TIMEOUT`, kill.
  * Log structured reason: `reason="no_progress"` or `reason="broker_disconnected"`.

### Step 2 — Fail fast: admission control & overload hygiene

* [ ] Add **MAX\_QUEUE** and **MAX\_INFLIGHT** envs with sane defaults and per-model overrides.
* [ ] On intake:

  * If `queue ≥ MAX_QUEUE` → **reject immediately** with `overloaded=true`, `retry_after_ms`.
  * Publish **backpressure** metric and broker signal (bridges can shed load earlier).
* [ ] Implement **work-budget** per request (deadline in ms). If budget exceeded while waiting → cancel.
* [ ] Add **latency guard**: if `avg_job_ms × inflight > SLAM_LIMIT_MS` → temporarily pause intake.

### Step 3 — Watchdog & exit semantics

* [ ] Add a small **watchdog** in the embedding service (same process, separate timer):

  * Checks every `WATCHDOG_INTERVAL_MS`:

    * If broker state `disconnected` for `> DISCONNECT_KILL_MS` → `process.exit(70)`.
    * If `now - last_progress_ts > LIVENESS_MAX_STALL_MS` → `process.exit(71)`.
* [ ] Ensure **SIGTERM** handler: stop intake, set `readiness=false`, drain up to `DRAIN_MS`, then `process.exit(0)`.
* [ ] PM2 / supervisor: restart on exit codes 70/71; **alert** if restart count threshold exceeded.

### Step 4 — Reproduce, test, and document

* [ ] **Chaos script** to simulate:

  1. broker disconnect kill socket / firewall rule,
  2. load spike (burst 10× queue),
  3. slow model (inject sleep).
     Expect: fast rejection, watchdog exit, heartbeat kill if watchdog disabled.
* [ ] **Parity tests** for fail-fast semantics: callers get `429`/`overloaded` vs hanging.
* [ ] Dashboards: queue depth, inflight, job latency, disconnect duration, kill reasons.
* [ ] Docs: tuning guide `MAX_QUEUE`, `MAX_INFLIGHT`, `HEARTBEAT_TIMEOUT`, `DISCONNECT_KILL_MS`, `DRAIN_MS`, and the “Why we exit on disconnect” note.

---

## 🔧 Config (envs)

```
EMBED_MAX_INFLIGHT=8
EMBED_MAX_QUEUE=256
EMBED_LIVENESS_MAX_STALL_MS=30000
EMBED_DISCONNECT_KILL_MS=10000
EMBED_WATCHDOG_INTERVAL_MS=1000
EMBED_DRAIN_MS=5000
HEARTBEAT_TIMEOUT=45000
```

---

## 🧩 Code sketches (tight & minimal)
```
**Admission control**
```
```ts
function admit(): boolean {
  return queue.length + inflight < EMBED_MAX_QUEUE;
}

function enqueue(job) {
  if (!admit()) return failFast(job, { overloaded: true, retry_after_ms: 250 });
  queue.push(job);
}
```
```
**Progress + watchdog**
```
```ts
let lastProgress = Date.now();
broker.on('connected', () => state.connected = true);
broker.on('disconnected', () => state.connected = false);

async function workLoop() {
  while (running) {
    const job = queue.shift();
    if (!job) { await sleep(5); continue; }
    inflight++;
    try {
      await handle(job);
    } finally {
      inflight--;
      lastProgress = Date.now();
    }
  }
}

setInterval(() => {
  const now = Date.now();
  if (!state.connected && now - state.lastDisconnectAt > EMBED_DISCONNECT_KILL_MS) {
    log.error('watchdog', { reason: 'broker_disconnected' }); process.exit(70);
  }
  if (now - lastProgress > EMBED_LIVENESS_MAX_STALL_MS) {
    log.error('watchdog', { reason: 'no_progress' }); process.exit(71);
  }
}, EMBED_WATCHDOG_INTERVAL_MS);
```
```
**Heartbeat payload**
```
```ts
heartbeatClient.send({
  pid: process.pid, name: 'embeddings',
  connected: state.connected, queue: queue.length, inflight,
  last_progress_ts: lastProgress, avg_job_ms: metrics.avgJobMs()
});
```
```
**Graceful shutdown**
```
```ts
process.on('SIGTERM', async () => {
  ready = false; running = false; const t0 = Date.now();
  while (inflight > 0 && Date.now() - t0 < EMBED_DRAIN_MS) await sleep(50);
  process.exit(0);
});
```

---

## ✅ Acceptance Criteria

* [ ] Under forced broker disconnect, embedding service exits within **≤ EMBED\_DISCONNECT\_KILL\_MS + WATCHDOG\_INTERVAL\_MS** (watchdog path).
* [ ] If progress stalls **> EMBED\_LIVENESS\_MAX\_STALL\_MS**, service exits; heartbeat can also kill if watchdog disabled.
* [ ] When **MAX\_QUEUE** is reached, new requests are **rejected immediately** (no hang), and dependents observe `overloaded` with `retry_after_ms`.
* [ ] Heartbeat dashboard shows `connected`, `queue`, `inflight`, `last_progress_ts`; kills occur when policies fire; kill reason logged.
* [ ] Chaos test proves: no zombie state; dependents recover; system keeps breathing.
* [ ] Docs present with tuning guidance and thresholds; PM2/supervisor configured to restart and alert on loops.

---

## 📂 Proposed Files/Paths

* `services/ts/embeddings/worker.ts` — admission control + progress ticker
* `services/ts/embeddings/watchdog.ts` — broker/liveness watchdog
* `services/ts/embeddings/health.ts` — live/ready endpoints or broker health topic
* `shared/ts/src/heartbeat/client.ts` — payload extended connected/queue/inflight/last\_progress\_ts
* `services/ts/heartbeat/server.ts` — kill policies for new fields
* `tests/chaos/embeddings.disconnect.spec.ts` — disconnect/overload chaos tests
* `docs/runbooks/embeddings-health.md` — tuning, failure modes, ops actions

---

## 🔍 Debug checklist use before/after

* Broker logs show **disconnect** → embedding logs show **watchdog exit** within bound.
* Heartbeat shows **stalled progress** → kill → supervisor restart.
* Dependents receive **fail-fast** responses, not timeouts (inspect bridge logs).
* No request spends > budgeted time in queue; queues drop after kill/restart.

---

## 🧯 Pitfalls & guardrails

* Don’t rely only on **socket events**—TLS stalls can leave a half-open connection; the **progress ticker** is your truth.
* **Slow model** ≠ dead process: measure *progress*, not just *connection*.
* Avoid “graceful drain forever”: enforce **hard DRAIN\_MS cap**.
* Watch for **restart storms**: cap concurrency and consider exponential backoff on reconnect.

---

## Step 1–4 (your minimal milestone format)

* [ ] **Step 1 — Health Semantics:** implement live/ready; progress ticker; heartbeat payloads; server kill rules.
* [ ] **Step 2 — Admission Control:** MAX\_QUEUE/MAX\_INFLIGHT + fail-fast + deadlines.
* [ ] **Step 3 — Watchdog & Shutdown:** broker/liveness watchdog; graceful drain; supervised restarts; alerts.
* [ ] **Step 4 — Chaos & Docs:** disconnect + overload chaos tests; dashboards; runbook; finalize thresholds.

---

## Commit template

```
fix(embeddings): kill-on-disconnect/stall + admission control + heartbeat kill policies

- Add progress-based liveness and broker-aware readiness
- Enforce MAX_QUEUE/MAX_INFLIGHT with fail-fast overload responses
- Watchdog exits on broker disconnect or no-progress conditions
- Heartbeat payloads & server policies updated; kill reasons logged
- Chaos tests for disconnect/overload; docs & tuning guide
```

\#tags #embeddings #reliability #heartbeat #watchdog #overload #backpressure #chaos #pm2 #broker #promethean

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 5
```
#in-progress
```
