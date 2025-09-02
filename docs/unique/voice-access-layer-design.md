---
uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
created_at: 2025.08.25.18.44.35.md
filename: Voice Access Layer Design
description: >-
  Design for tokenized voice access layer handling Discord-specific sockets,
  SSRC/SRTP keys, and Opus decode within a provider-tenant scoped agent. Ensures
  secure, efficient voice channel management with precise timing and health
  metrics.
tags:
  - voice
  - discord
  - rtp
  - ssrc
  - opus
  - token
  - tenant
  - agent
  - dsp
  - ai
related_to_title: []
related_to_uuid: []
references: []
---
Short version: it lines up cleanly if you treat **voice** like the gateway/rest split—but for **RTP/UDP**. Put all Discord-specific sockets, SSRC/SRTP keys, and Opus decode **inside a “voice access” agent** per (provider, tenant). Everything after that is boring, tokenless DSP workers (VAD → chunker → STT → LLM → TTS → playback), same envelope and topic rules. ^ref-543ed9b3-1-0

Here’s the concrete carve-up. ^ref-543ed9b3-3-0

# 1) Voice Access Layer (tokened, per provider+tenant)

### Responsibilities

* Join/leave voice channels (Discord voice WebSocket + UDP).
* Manage **voice server state**: endpoint, session\_id, token, SSRCs, ssrc→user\_id map, secret key. ^ref-543ed9b3-10-0
* Handle **RTP** receive: decode Opus → uniform PCM frames. ^ref-543ed9b3-11-0
* Handle **RTP** send: accept PCM/Opus frames and transmit back to Discord. ^ref-543ed9b3-12-0
* Emit precise timing/health (ping, jitter, packet loss, clock skew). ^ref-543ed9b3-13-0

### Topics (Discord example)

```
# control
promethean.p.discord.t.<tenant>.voice.control.join
promethean.p.discord.t.<tenant>.voice.control.leave
promethean.p.discord.t.<tenant>.voice.control.set-bitrate

# state/health
promethean.p.discord.t.<tenant>.voice.state.connected
promethean.p.discord.t.<tenant>.voice.health

# inbound audio from Discord
promethean.p.discord.t.<tenant>.voice.audio.rtp   # optional raw
promethean.p.discord.t.<tenant>.voice.audio.pcm   # normalized PCM frames

# outbound audio to Discord (what you want the bot to speak)
promethean.p.discord.t.<tenant>.voice.play.pcm
promethean.p.discord.t.<tenant>.voice.play.opus
```
^ref-543ed9b3-17-0

### Envelopes (payload sketches)
 ^ref-543ed9b3-38-0
```ts
// control.join
{
  provider:"discord", tenant:"duck", intent:"voice.control.join",
  payload:{ guild_id:string, channel_id:string, session_id:string, prefer_opus:boolean }
}

// state.connected (from access)
{
  provider:"discord", tenant:"duck", intent:"voice.state.connected",
  payload:{ guild_id, channel_id, session_id, ssrc_map: Record<string /*ssrc*/, string /*user_id*/>,
            sample_rate:48000, channels:2, frame_hop_ms:20 }
}

// audio.pcm (from access; tokenless consumers subscribe here)
{
  provider:"discord", tenant:"duck", intent:"voice.audio.pcm",
  payload:{
    session_id:string,
    user_id:string,             // resolved via ssrc map
    ts_device_ms:number,        // capture timestamp
    ts_monotonic_ns:string,     // bigint as string for precise ordering
    format:{ rate_hz:48000, channels:1|2, codec:"pcm_s16le" },
    data_path:string,           // tmp path OR data_b64
    rtp:{ ssrc:number, seq:number, timestamp:number, lost?:number, jitter?:number }
  }
}

// play.pcm (to access; access converts to RTP and sends)
{
  provider:"discord", tenant:"duck", intent:"voice.play.pcm",
  payload:{
    session_id:string,
    format:{ rate_hz:24000, channels:1, codec:"pcm_s16le" },
    data_path:string, // produced by TTS
    ducking_db?: number,
    gain_db?: number
  }
}
^ref-543ed9b3-38-0
``` ^ref-543ed9b3-79-0

> All the SRTP voodoo stays in **providers/discord/voice-access**. Downstream never needs tokens or SSRC secrets.

# 2) DSP & AI Workers (tokenless, tenant-aware) ^ref-543ed9b3-83-0

These are just subscribers to `voice.audio.pcm` and publishers of higher-level events. They remain **provider-agnostic**.

### Recommended pipeline (each step is a separate worker): ^ref-543ed9b3-87-0

1. **VAD + Chunker** ^ref-543ed9b3-89-0
 ^ref-543ed9b3-90-0
   * **In:** `voice.audio.pcm` ^ref-543ed9b3-91-0
   * **Out:** `voice.audio.segment` (PCM slices with start/end)
   * Payload adds `segment_id`, `ts_start`, `ts_end`, `energy_rms`, `snr`. ^ref-543ed9b3-93-0

2. **Spectrogram** ^ref-543ed9b3-95-0
 ^ref-543ed9b3-96-0
   * **In:** `voice.audio.segment`
   * **Out:** `voice.audio.spectrogram` ^ref-543ed9b3-98-0
   * Payload fields: `{ image_path?, mel_npz_path, n_mels, hop_length, win_length }`
   * This is where your spectrogram visualizations & analysis live—no provider logic. ^ref-543ed9b3-100-0

3. **STT** ^ref-543ed9b3-102-0
 ^ref-543ed9b3-103-0
   * **In:** `voice.audio.segment` (or `spectrogram` if your model consumes mels) ^ref-543ed9b3-104-0
   * **Out:** `duck.transcript.segment` (what we specced earlier)
   * Track `rtf` (real-time factor), `confidence`, token counts. ^ref-543ed9b3-106-0

4. **LLM (Cephalon-Social)** ^ref-543ed9b3-108-0
 ^ref-543ed9b3-109-0
   * **In:** `duck.transcript.segment` ^ref-543ed9b3-110-0
   * **Out:** `duck.reply.message` and a **provider-agnostic command** `social.command.post` (see below)
   * Also emit `voice.intent` if you split intents (e.g., “play soundboard”, “do TTS reply”). ^ref-543ed9b3-112-0

5. **TTS** ^ref-543ed9b3-114-0
 ^ref-543ed9b3-115-0
   * **In:** `duck.reply.message`
   * **Out:** `voice.play.pcm` (or `voice.play.opus`) ^ref-543ed9b3-117-0

Everything above is tokenless and references **`provider` + `tenant`** only for routing and storage namespaces.

### Topics for DSP ^ref-543ed9b3-121-0

```
promethean.p.*.t.*.voice.audio.segment
promethean.p.*.t.*.voice.audio.spectrogram
promethean.p.*.t.*.duck.transcript.segment
^ref-543ed9b3-121-0
promethean.p.*.t.*.duck.reply.message
```
 ^ref-543ed9b3-130-0
### Payload sketches

```ts
// audio.segment
{
  provider, tenant, intent:"voice.audio.segment",
  payload:{
    session_id, user_id, segment_id,
    ts_start:number, ts_end:number,
    format:{ rate_hz:48000, channels:1, codec:"pcm_s16le" },
    data_path:string,
    vad:{ method:"webrtc|silero|energy", silence_ms:number, threshold:number, snr?:number }
  }
}

// audio.spectrogram
{
  provider, tenant, intent:"voice.audio.spectrogram",
  payload:{
    session_id, segment_id,
    mel_npz_path:string,
    n_mels:number, hop_length:number, win_length:number,
    fmin?:number, fmax?:number
^ref-543ed9b3-130-0
  }
}
``` ^ref-543ed9b3-157-0

# 3) Non-REST tenant stuff (fits under “provider access” too)
 ^ref-543ed9b3-160-0
“Non-REST” basically means **anything that needs provider credentials or sockets**: ^ref-543ed9b3-161-0
 ^ref-543ed9b3-162-0
* Voice gateways & UDP (covered).
* Webhook/WebSocket firehoses (e.g., Twitch EventSub over WS, Bluesky firehose). ^ref-543ed9b3-164-0
* OAuth refresh/PKCE for providers (store in **Provider Registry**, not in workers).
* Any **provider-specific crypto** (e.g., Discord SRTP key derivation).

Rule of thumb: if it requires **provider keys or handshakes**, put it in `shared/ts/src/providers/<provider>/*` helpers and the corresponding **access agent**. Publish normalized events to the bus; keep workers blind to the provider details. ^ref-543ed9b3-168-0

# 4) Where code lives in your namespaced shared lib ^ref-543ed9b3-170-0
 ^ref-543ed9b3-171-0
* `providers/discord/voice/` (helpers used only by the voice access agent) ^ref-543ed9b3-172-0
 ^ref-543ed9b3-173-0
  * `gateway.ts` (voice WS handshake, resume, heartbeats)
  * `rtp.ts` (Opus decode/encode, jitter buffer) ^ref-543ed9b3-175-0
  * `normalize.ts` (user\_id/ssrc mapping)
  * `health.ts` (jitter/packet-loss calc)

**Access agent** imports those, not your workers.

Workers import only `@shared/ts/dist/platform/*` and `effects/*`.

# 5) Policy & Capabilities (voice) ^ref-543ed9b3-183-0

Add provider-parametric voice caps—only access agents are allowed:

```ts
// src/agent/policy.ts
export type Capability =
  | { kind:"provider.gateway.connect"; provider:string; tenant:string }
  | { kind:"provider.rest.call";      provider:string; tenant:string; route:string }
  | { kind:"provider.voice.connect";  provider:string; tenant:string; guild_id:string; channel_id:string }
  | { kind:"provider.voice.send";     provider:string; tenant:string; guild_id:string; channel_id:string }
  | { kind:"storage.mongo"; db:string; coll:string }
^ref-543ed9b3-183-0
  | { kind:"embed.text"; model:string } ^ref-543ed9b3-196-0
  | { kind:"embed.image"; model:string }
  | { kind:"http.fetch"; url:string; method?:string };
```
 ^ref-543ed9b3-200-0
Workers never need `provider.voice.*`. ^ref-543ed9b3-201-0
 ^ref-543ed9b3-202-0
# 6) Clocking, latency, and backpressure (don’t skip)
 ^ref-543ed9b3-204-0
* **Clock domain:** carry `ts_monotonic_ns` with every audio frame and segment. Don’t trust wall clock for ordering. ^ref-543ed9b3-205-0
* **Frame spec:** standardize on 20 ms hop (960 samples @ 48 kHz) for PCM frames upstream; resample at access if needed.
* **Backpressure:** if downstream lags, the **voice access** agent must:

  * drop or downsample (emit `DEGRADED` health),
  * expose queue depth metrics, ^ref-543ed9b3-210-0
  * never block RTP receive (you’ll drift or get kicked).
 ^ref-543ed9b3-212-0
# 7) Playback arbitration
 ^ref-543ed9b3-214-0
When both TTS and other audio compete: ^ref-543ed9b3-215-0
 ^ref-543ed9b3-216-0
* Have a **voice-mixer** worker (tokenless) that:

  * **In:** `voice.play.pcm` events (from TTS or SFX)
  * **Out:** **one** ordered stream to access (`voice.play.pcm.out`) ^ref-543ed9b3-220-0
  * Does ducking/mixing/fades, enforces a single playback queue per session.
 ^ref-543ed9b3-222-0
# 8) “Post a text reply” without touching Discord in workers

Use the provider-agnostic command you already planned:

```
promethean.p.<provider>.t.<tenant>.social.command.post
{
  provider, tenant,
^ref-543ed9b3-222-0
  space_urn: "urn:discord:channel:duck:123...", ^ref-543ed9b3-232-0
  in_reply_to?: "urn:discord:message:duck:456...",
  text, attachments:[]
}
```
^ref-543ed9b3-236-0

The **access rest agent** maps this to provider routes (Discord `POST /channels/{id}/messages`, Reddit comment, etc.).

# 9) Minimal manifests (just the parts you care about)

```yaml
# services/ts/discord-voice-access/agent.yml
agent:
  id: discord-voice-access
  kind: provider-voice-access
  version: 0.1.0
  binds: { provider: "discord", tenants: ["duck"] }
  inputs:
    - topic: promethean.p.discord.t.*.voice.control.(join|leave|set-bitrate)
    - topic: promethean.p.discord.t.*.voice.play.(pcm|opus)
  outputs:
    - topic: promethean.p.discord.t.*.voice.state.connected
^ref-543ed9b3-236-0
    - topic: promethean.p.discord.t.*.voice.health
    - topic: promethean.p.discord.t.*.voice.audio.(rtp|pcm)
  capabilities:
    - provider.voice.connect: {}
    - provider.voice.send: {}
^ref-543ed9b3-255-0
```
^ref-543ed9b3-255-0

```yaml
# services/ts/vad-chunker/agent.yml
agent:
  id: vad-chunker
  kind: dsp
  version: 0.1.0
^ref-543ed9b3-255-0
  binds: { provider: "*", tenants: ["*"] }
  inputs:
    - topic: promethean.p.*.t.*.voice.audio.pcm
  outputs:
    - topic: promethean.p.*.t.*.voice.audio.segment
  capabilities: []
```

```yaml
# services/ts/spectrogram/agent.yml
agent:
  id: spectrogram
  kind: dsp
  version: 0.1.0
  inputs: ^ref-543ed9b3-283-0
    - topic: promethean.p.*.t.*.voice.audio.segment ^ref-543ed9b3-284-0
  outputs: ^ref-543ed9b3-285-0
^ref-543ed9b3-286-0
^ref-543ed9b3-285-0
^ref-543ed9b3-284-0
^ref-543ed9b3-283-0
    - topic: promethean.p.*.t.*.voice.audio.spectrogram ^ref-543ed9b3-286-0 ^ref-543ed9b3-292-0
^ref-543ed9b3-293-0 ^ref-543ed9b3-294-0
^ref-543ed9b3-292-0
^ref-543ed9b3-286-0 ^ref-543ed9b3-296-0
^ref-543ed9b3-285-0
^ref-543ed9b3-284-0 ^ref-543ed9b3-298-0
^ref-543ed9b3-283-0 ^ref-543ed9b3-299-0
``` ^ref-543ed9b3-293-0 ^ref-543ed9b3-300-0
^ref-543ed9b3-293-0
^ref-543ed9b3-292-0 ^ref-543ed9b3-302-0
^ref-543ed9b3-286-0
^ref-543ed9b3-285-0
^ref-543ed9b3-284-0
^ref-543ed9b3-283-0
^ref-543ed9b3-280-0
 ^ref-543ed9b3-294-0
# 10) How it plugs into what you already have ^ref-543ed9b3-302-0
 ^ref-543ed9b3-296-0
* Your **OpenVINO Whisper** sits in the STT worker, subscribed to `voice.audio.segment`. No token leakage.
* Your **spectrogram renderer** becomes its own worker; it can store PNG/NPZ to `/var/promethean/tmp/**` (policy-gated). ^ref-543ed9b3-292-0 ^ref-543ed9b3-298-0
* Your **existing TTS** publishes `voice.play.pcm`; access agent handles Opus encode + RTP. ^ref-543ed9b3-293-0 ^ref-543ed9b3-299-0
* Duck’s **text chat** path is unchanged; it’s just another event source (normalized `SocialMessageCreated`) that can also trigger TTS. ^ref-543ed9b3-294-0 ^ref-543ed9b3-300-0

--- ^ref-543ed9b3-296-0 ^ref-543ed9b3-302-0

## Bottom line ^ref-543ed9b3-298-0
 ^ref-543ed9b3-299-0
* All **tenant-specific, non-REST** plumbing (voice sockets, SRTP, jitter) lives in a **voice access agent** per provider/tenant. ^ref-543ed9b3-300-0
* **Everything audio/ML** downstream is **provider-agnostic** and tokenless, glued by the same envelope + topics you’ve already adopted.
* This generalizes to Twitch voice/video or Reddit streams by swapping the **access** adapter, not your DSP pipeline. ^ref-543ed9b3-302-0
 ^ref-543ed9b3-323-0
If you want, I can extend the zip with:

* `providers/discord/voice/` stubs (ws handshake, rtp codec interfaces),
* the topic constants under `platform/topic.ts`,
* and skeleton manifests for `discord-voice-access`, `vad-chunker`, `spectrogram`, `stt-whisper`, `voice-mixer`.

\#hashtags ^ref-543ed9b3-323-0
\#promethean #discord #voice #rtp #opus #vad #spectrogram #stt #tts #access-layer #provider-agnostic #tenant #event-driven #typescript #openvino<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Shared Package Structure](shared-package-structure.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [template-based-compilation](template-based-compilation.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [EidolonField](eidolonfield.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [DSL](chunks/dsl.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [archetype-ecs](archetype-ecs.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [JavaScript](chunks/javascript.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Tooling](chunks/tooling.md)
- [Services](chunks/services.md)
- [Diagrams](chunks/diagrams.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Window Management](chunks/window-management.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Shared](chunks/shared.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Operations](chunks/operations.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [promethean-requirements](promethean-requirements.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Reawakening Duck](reawakening-duck.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
## Sources
- [Promethean Agent Config DSL — L74](promethean-agent-config-dsl.md#^ref-2c00ce45-74-0) (line 74, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L3](migrate-to-provider-tenant-architecture.md#^ref-54382370-3-0) (line 3, col 0, score 0.72)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.67)
- [Promethean Agent Config DSL — L195](promethean-agent-config-dsl.md#^ref-2c00ce45-195-0) (line 195, col 0, score 0.58)
- [Reawakening Duck — L30](reawakening-duck.md#^ref-59b5670f-30-0) (line 30, col 0, score 0.63)
- [Shared Package Structure — L5](shared-package-structure.md#^ref-66a72fc3-5-0) (line 5, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L138](migrate-to-provider-tenant-architecture.md#^ref-54382370-138-0) (line 138, col 0, score 0.59)
- [Reawakening Duck — L11](reawakening-duck.md#^ref-59b5670f-11-0) (line 11, col 0, score 0.62)
- [Local-Offline-Model-Deployment-Strategy — L249](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-249-0) (line 249, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L1](sibilant-meta-prompt-dsl.md#^ref-af5d2824-1-0) (line 1, col 0, score 0.67)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.58)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L329](chroma-embedding-refactor.md#^ref-8b256935-329-0) (line 329, col 0, score 0.63)
- [Diagrams — L24](chunks/diagrams.md#^ref-45cd25b5-24-0) (line 24, col 0, score 0.64)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-offload-workers — L500](ecs-offload-workers.md#^ref-6498b9d7-500-0) (line 500, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L132](migrate-to-provider-tenant-architecture.md#^ref-54382370-132-0) (line 132, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L81](migrate-to-provider-tenant-architecture.md#^ref-54382370-81-0) (line 81, col 0, score 0.6)
- [promethean-requirements — L1](promethean-requirements.md#^ref-95205cd3-1-0) (line 1, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L148](migrate-to-provider-tenant-architecture.md#^ref-54382370-148-0) (line 148, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L13](migrate-to-provider-tenant-architecture.md#^ref-54382370-13-0) (line 13, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L83](migrate-to-provider-tenant-architecture.md#^ref-54382370-83-0) (line 83, col 0, score 0.68)
- [Provider-Agnostic Chat Panel Implementation — L7](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-7-0) (line 7, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L239](migrate-to-provider-tenant-architecture.md#^ref-54382370-239-0) (line 239, col 0, score 0.66)
- [observability-infrastructure-setup — L304](observability-infrastructure-setup.md#^ref-b4e64f8c-304-0) (line 304, col 0, score 0.63)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.62)
- [plan-update-confirmation — L640](plan-update-confirmation.md#^ref-b22d79c6-640-0) (line 640, col 0, score 0.71)
- [Reawakening Duck — L79](reawakening-duck.md#^ref-59b5670f-79-0) (line 79, col 0, score 0.61)
- [Promethean Infrastructure Setup — L561](promethean-infrastructure-setup.md#^ref-6deed6ac-561-0) (line 561, col 0, score 0.62)
- [Model Upgrade Calm-Down Guide — L41](model-upgrade-calm-down-guide.md#^ref-db74343f-41-0) (line 41, col 0, score 0.58)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.57)
- [ParticleSimulationWithCanvasAndFFmpeg — L9](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-9-0) (line 9, col 0, score 0.66)
- [Universal Lisp Interface — L19](universal-lisp-interface.md#^ref-b01856b4-19-0) (line 19, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.57)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.57)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L5](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-5-0) (line 5, col 0, score 0.56)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.56)
- [Universal Lisp Interface — L61](universal-lisp-interface.md#^ref-b01856b4-61-0) (line 61, col 0, score 0.56)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.65)
- [Promethean Agent Config DSL — L163](promethean-agent-config-dsl.md#^ref-2c00ce45-163-0) (line 163, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L73](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-73-0) (line 73, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L242](migrate-to-provider-tenant-architecture.md#^ref-54382370-242-0) (line 242, col 0, score 0.59)
- [Promethean Agent DSL TS Scaffold — L380](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-380-0) (line 380, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L142](migrate-to-provider-tenant-architecture.md#^ref-54382370-142-0) (line 142, col 0, score 0.73)
- [aionian-circuit-math — L24](aionian-circuit-math.md#^ref-f2d83a77-24-0) (line 24, col 0, score 0.6)
- [Layer1SurvivabilityEnvelope — L139](layer1survivabilityenvelope.md#^ref-64a9f9f9-139-0) (line 139, col 0, score 0.61)
- [homeostasis-decay-formulas — L24](homeostasis-decay-formulas.md#^ref-37b5d236-24-0) (line 24, col 0, score 0.66)
- [homeostasis-decay-formulas — L11](homeostasis-decay-formulas.md#^ref-37b5d236-11-0) (line 11, col 0, score 0.64)
- [heartbeat-simulation-snippets — L3](heartbeat-simulation-snippets.md#^ref-23e221e9-3-0) (line 3, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L137](layer1survivabilityenvelope.md#^ref-64a9f9f9-137-0) (line 137, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L342](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-342-0) (line 342, col 0, score 0.62)
- [heartbeat-fragment-demo — L31](heartbeat-fragment-demo.md#^ref-dd00677a-31-0) (line 31, col 0, score 0.59)
- [heartbeat-fragment-demo — L46](heartbeat-fragment-demo.md#^ref-dd00677a-46-0) (line 46, col 0, score 0.59)
- [heartbeat-fragment-demo — L61](heartbeat-fragment-demo.md#^ref-dd00677a-61-0) (line 61, col 0, score 0.59)
- [heartbeat-simulation-snippets — L25](heartbeat-simulation-snippets.md#^ref-23e221e9-25-0) (line 25, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L113](migrate-to-provider-tenant-architecture.md#^ref-54382370-113-0) (line 113, col 0, score 0.65)
- [promethean-system-diagrams — L9](promethean-system-diagrams.md#^ref-b51e19b4-9-0) (line 9, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.86)
- [Eidolon-Field-Optimization — L40](eidolon-field-optimization.md#^ref-40e05c14-40-0) (line 40, col 0, score 0.68)
- [pm2-orchestration-patterns — L149](pm2-orchestration-patterns.md#^ref-51932e7b-149-0) (line 149, col 0, score 0.67)
- [promethean-system-diagrams — L95](promethean-system-diagrams.md#^ref-b51e19b4-95-0) (line 95, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L209](migrate-to-provider-tenant-architecture.md#^ref-54382370-209-0) (line 209, col 0, score 0.65)
- [ripple-propagation-demo — L74](ripple-propagation-demo.md#^ref-8430617b-74-0) (line 74, col 0, score 0.63)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.64)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.63)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.62)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.62)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.62)
- [js-to-lisp-reverse-compiler — L383](js-to-lisp-reverse-compiler.md#^ref-58191024-383-0) (line 383, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L251](migrate-to-provider-tenant-architecture.md#^ref-54382370-251-0) (line 251, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L146](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-146-0) (line 146, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L82](migrate-to-provider-tenant-architecture.md#^ref-54382370-82-0) (line 82, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L229](migrate-to-provider-tenant-architecture.md#^ref-54382370-229-0) (line 229, col 0, score 0.6)
- [Per-Domain Policy System for JS Crawler — L458](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-458-0) (line 458, col 0, score 0.6)
- [Provider-Agnostic Chat Panel Implementation — L14](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-14-0) (line 14, col 0, score 0.61)
- [archetype-ecs — L417](archetype-ecs.md#^ref-8f4c1e86-417-0) (line 417, col 0, score 0.64)
- [Shared Package Structure — L155](shared-package-structure.md#^ref-66a72fc3-155-0) (line 155, col 0, score 0.66)
- [Promethean-native config design — L43](promethean-native-config-design.md#^ref-ab748541-43-0) (line 43, col 0, score 0.59)
- [Shared Package Structure — L56](shared-package-structure.md#^ref-66a72fc3-56-0) (line 56, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L350](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-350-0) (line 350, col 0, score 0.6)
- [Provider-Agnostic Chat Panel Implementation — L13](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-13-0) (line 13, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L139](dynamic-context-model-for-web-components.md#^ref-f7702bf8-139-0) (line 139, col 0, score 0.59)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.56)
- [Dynamic Context Model for Web Components — L313](dynamic-context-model-for-web-components.md#^ref-f7702bf8-313-0) (line 313, col 0, score 0.6)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.64)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.67)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L166](dynamic-context-model-for-web-components.md#^ref-f7702bf8-166-0) (line 166, col 0, score 0.57)
- [Functional Embedding Pipeline Refactor — L303](functional-embedding-pipeline-refactor.md#^ref-a4a25141-303-0) (line 303, col 0, score 0.57)
- [Chroma-Embedding-Refactor — L250](chroma-embedding-refactor.md#^ref-8b256935-250-0) (line 250, col 0, score 0.55)
- [Language-Agnostic Mirror System — L3](language-agnostic-mirror-system.md#^ref-d2b3628c-3-0) (line 3, col 0, score 0.55)
- [Dynamic Context Model for Web Components — L151](dynamic-context-model-for-web-components.md#^ref-f7702bf8-151-0) (line 151, col 0, score 0.54)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.54)
- [Chroma Toolkit Consolidation Plan — L144](chroma-toolkit-consolidation-plan.md#^ref-5020e892-144-0) (line 144, col 0, score 0.88)
- [Vectorial Exception Descent — L60](vectorial-exception-descent.md#^ref-d771154e-60-0) (line 60, col 0, score 0.87)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.67)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.67)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.67)
- [Promethean Documentation Pipeline Overview — L62](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-62-0) (line 62, col 0, score 0.65)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.77)
- [Recursive Prompt Construction Engine — L21](recursive-prompt-construction-engine.md#^ref-babdb9eb-21-0) (line 21, col 0, score 0.6)
- [Board Walk – 2025-08-11 — L127](board-walk-2025-08-11.md#^ref-7aa1eb92-127-0) (line 127, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L91](sibilant-meta-prompt-dsl.md#^ref-af5d2824-91-0) (line 91, col 0, score 0.76)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L101](migrate-to-provider-tenant-architecture.md#^ref-54382370-101-0) (line 101, col 0, score 0.75)
- [Migrate to Provider-Tenant Architecture — L100](migrate-to-provider-tenant-architecture.md#^ref-54382370-100-0) (line 100, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L98](migrate-to-provider-tenant-architecture.md#^ref-54382370-98-0) (line 98, col 0, score 0.73)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.73)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.73)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.65)
- [template-based-compilation — L41](template-based-compilation.md#^ref-f8877e5e-41-0) (line 41, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-303-0) (line 303, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L345](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-345-0) (line 345, col 0, score 0.67)
- [Fnord Tracer Protocol — L214](fnord-tracer-protocol.md#^ref-fc21f824-214-0) (line 214, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L211](migrate-to-provider-tenant-architecture.md#^ref-54382370-211-0) (line 211, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L208](migrate-to-provider-tenant-architecture.md#^ref-54382370-208-0) (line 208, col 0, score 0.62)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.57)
- [Local-Offline-Model-Deployment-Strategy — L240](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-240-0) (line 240, col 0, score 0.61)
- [Fnord Tracer Protocol — L172](fnord-tracer-protocol.md#^ref-fc21f824-172-0) (line 172, col 0, score 0.62)
- [Diagrams — L20](chunks/diagrams.md#^ref-45cd25b5-20-0) (line 20, col 0, score 0.58)
- [Duck's Attractor States — L64](ducks-attractor-states.md#^ref-13951643-64-0) (line 64, col 0, score 0.58)
- [Promethean_Eidolon_Synchronicity_Model — L54](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-54-0) (line 54, col 0, score 0.58)
- [Synchronicity Waves and Web — L80](synchronicity-waves-and-web.md#^ref-91295f3a-80-0) (line 80, col 0, score 0.58)
- [Unique Info Dump Index — L121](unique-info-dump-index.md#^ref-30ec3ba6-121-0) (line 121, col 0, score 0.58)
- [Promethean Agent Config DSL — L289](promethean-agent-config-dsl.md#^ref-2c00ce45-289-0) (line 289, col 0, score 0.57)
- [Dynamic Context Model for Web Components — L197](dynamic-context-model-for-web-components.md#^ref-f7702bf8-197-0) (line 197, col 0, score 0.56)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.69)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.76)
- [ParticleSimulationWithCanvasAndFFmpeg — L247](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-247-0) (line 247, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L493](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-493-0) (line 493, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L458](performance-optimized-polyglot-bridge.md#^ref-f5579967-458-0) (line 458, col 0, score 0.62)
- [Pipeline Enhancements — L6](pipeline-enhancements.md#^ref-e2135d9f-6-0) (line 6, col 0, score 0.62)
- [plan-update-confirmation — L1023](plan-update-confirmation.md#^ref-b22d79c6-1023-0) (line 1023, col 0, score 0.62)
- [pm2-orchestration-patterns — L263](pm2-orchestration-patterns.md#^ref-51932e7b-263-0) (line 263, col 0, score 0.62)
- [polyglot-repl-interface-layer — L183](polyglot-repl-interface-layer.md#^ref-9c79206d-183-0) (line 183, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L539](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-539-0) (line 539, col 0, score 0.62)
- [polymorphic-meta-programming-engine — L220](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-220-0) (line 220, col 0, score 0.62)
- [Fnord Tracer Protocol — L140](fnord-tracer-protocol.md#^ref-fc21f824-140-0) (line 140, col 0, score 0.61)
- [Shared Package Structure — L122](shared-package-structure.md#^ref-66a72fc3-122-0) (line 122, col 0, score 0.65)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L95](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-95-0) (line 95, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.58)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L19](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-19-0) (line 19, col 0, score 0.59)
- [Model Selection for Lightweight Conversational Tasks — L118](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-118-0) (line 118, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.7)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L155](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-155-0) (line 155, col 0, score 0.6)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.63)
- [Eidolon Field Abstract Model — L88](eidolon-field-abstract-model.md#^ref-5e8b2388-88-0) (line 88, col 0, score 0.74)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 0.6)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 0.6)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 0.6)
- [Promethean Data Sync Protocol — L5](promethean-data-sync-protocol.md#^ref-9fab9e76-5-0) (line 5, col 0, score 0.6)
- [Promethean Dev Workflow Update — L66](promethean-dev-workflow-update.md#^ref-03a5578f-66-0) (line 66, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L165](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-165-0) (line 165, col 0, score 0.6)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.67)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.66)
- [Promethean Infrastructure Setup — L543](promethean-infrastructure-setup.md#^ref-6deed6ac-543-0) (line 543, col 0, score 0.69)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L326](dynamic-context-model-for-web-components.md#^ref-f7702bf8-326-0) (line 326, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L41](dynamic-context-model-for-web-components.md#^ref-f7702bf8-41-0) (line 41, col 0, score 0.62)
- [ecs-offload-workers — L450](ecs-offload-workers.md#^ref-6498b9d7-450-0) (line 450, col 0, score 0.62)
- [ripple-propagation-demo — L89](ripple-propagation-demo.md#^ref-8430617b-89-0) (line 89, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.6)
- [Local-Only-LLM-Workflow — L161](local-only-llm-workflow.md#^ref-9a8ab57e-161-0) (line 161, col 0, score 0.6)
- [Duck's Self-Referential Perceptual Loop — L19](ducks-self-referential-perceptual-loop.md#^ref-71726f04-19-0) (line 19, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L13](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-13-0) (line 13, col 0, score 0.71)
- [universal-intention-code-fabric — L24](universal-intention-code-fabric.md#^ref-c14edce7-24-0) (line 24, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L161](sibilant-meta-prompt-dsl.md#^ref-af5d2824-161-0) (line 161, col 0, score 0.65)
- [Recursive Prompt Construction Engine — L75](recursive-prompt-construction-engine.md#^ref-babdb9eb-75-0) (line 75, col 0, score 0.69)
- [universal-intention-code-fabric — L415](universal-intention-code-fabric.md#^ref-c14edce7-415-0) (line 415, col 0, score 0.68)
- [prompt-programming-language-lisp — L3](prompt-programming-language-lisp.md#^ref-d41a06d1-3-0) (line 3, col 0, score 0.68)
- [Vectorial Exception Descent — L30](vectorial-exception-descent.md#^ref-d771154e-30-0) (line 30, col 0, score 0.68)
- [Factorio AI with External Agents — L29](factorio-ai-with-external-agents.md#^ref-a4d90289-29-0) (line 29, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L64](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-64-0) (line 64, col 0, score 0.64)
- [Promethean Documentation Pipeline Overview — L27](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-27-0) (line 27, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L107](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-107-0) (line 107, col 0, score 0.63)
- [Provider-Agnostic Chat Panel Implementation — L8](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-8-0) (line 8, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L170](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-170-0) (line 170, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L888](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-888-0) (line 888, col 0, score 0.62)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L146](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-146-0) (line 146, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L188](local-only-llm-workflow.md#^ref-9a8ab57e-188-0) (line 188, col 0, score 0.62)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Universal Lisp Interface — L117](universal-lisp-interface.md#^ref-b01856b4-117-0) (line 117, col 0, score 0.88)
- [Local-First Intention→Code Loop with Free Models — L116](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-116-0) (line 116, col 0, score 0.84)
- [shared-package-layout-clarification — L155](shared-package-layout-clarification.md#^ref-36c8882a-155-0) (line 155, col 0, score 0.82)
- [Universal Lisp Interface — L90](universal-lisp-interface.md#^ref-b01856b4-90-0) (line 90, col 0, score 0.66)
- [Promethean-native config design — L38](promethean-native-config-design.md#^ref-ab748541-38-0) (line 38, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L827](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-827-0) (line 827, col 0, score 0.65)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.65)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [prompt-programming-language-lisp — L43](prompt-programming-language-lisp.md#^ref-d41a06d1-43-0) (line 43, col 0, score 0.77)
- [Migrate to Provider-Tenant Architecture — L51](migrate-to-provider-tenant-architecture.md#^ref-54382370-51-0) (line 51, col 0, score 0.69)
- [Promethean Agent Config DSL — L12](promethean-agent-config-dsl.md#^ref-2c00ce45-12-0) (line 12, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L241](migrate-to-provider-tenant-architecture.md#^ref-54382370-241-0) (line 241, col 0, score 0.61)
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.84)
- [Protocol_0_The_Contradiction_Engine — L10](protocol-0-the-contradiction-engine.md#^ref-9a93a756-10-0) (line 10, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L14](migrate-to-provider-tenant-architecture.md#^ref-54382370-14-0) (line 14, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L356](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-356-0) (line 356, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L147](prompt-folder-bootstrap.md#^ref-bd4f0976-147-0) (line 147, col 0, score 0.6)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L155](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-155-0) (line 155, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L91](dynamic-context-model-for-web-components.md#^ref-f7702bf8-91-0) (line 91, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.67)
- [Exception Layer Analysis — L78](exception-layer-analysis.md#^ref-21d5cc09-78-0) (line 78, col 0, score 0.59)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L109](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-109-0) (line 109, col 0, score 0.58)
- [ecs-offload-workers — L444](ecs-offload-workers.md#^ref-6498b9d7-444-0) (line 444, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L72](migrate-to-provider-tenant-architecture.md#^ref-54382370-72-0) (line 72, col 0, score 0.62)
- [i3-config-validation-methods — L1](i3-config-validation-methods.md#^ref-d28090ac-1-0) (line 1, col 0, score 0.57)
- [ecs-offload-workers — L441](ecs-offload-workers.md#^ref-6498b9d7-441-0) (line 441, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 0.63)
- [Event Bus MVP — L550](event-bus-mvp.md#^ref-534fe91d-550-0) (line 550, col 0, score 0.63)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 0.63)
- [Local-First Intention→Code Loop with Free Models — L142](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-142-0) (line 142, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 0.63)
- [Event Bus MVP — L532](event-bus-mvp.md#^ref-534fe91d-532-0) (line 532, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L28](migrate-to-provider-tenant-architecture.md#^ref-54382370-28-0) (line 28, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L421](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-421-0) (line 421, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L467](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-467-0) (line 467, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L3](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-3-0) (line 3, col 0, score 0.61)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.57)
- [Promethean Infrastructure Setup — L564](promethean-infrastructure-setup.md#^ref-6deed6ac-564-0) (line 564, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.62)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L412](js-to-lisp-reverse-compiler.md#^ref-58191024-412-0) (line 412, col 0, score 0.62)
- [Model Selection for Lightweight Conversational Tasks — L149](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-149-0) (line 149, col 0, score 0.63)
- [Mongo Outbox Implementation — L570](mongo-outbox-implementation.md#^ref-9c1acd1e-570-0) (line 570, col 0, score 0.63)
- [observability-infrastructure-setup — L365](observability-infrastructure-setup.md#^ref-b4e64f8c-365-0) (line 365, col 0, score 0.62)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L200](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-200-0) (line 200, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L471](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-471-0) (line 471, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L444](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-444-0) (line 444, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L12](migrate-to-provider-tenant-architecture.md#^ref-54382370-12-0) (line 12, col 0, score 0.61)
- [plan-update-confirmation — L935](plan-update-confirmation.md#^ref-b22d79c6-935-0) (line 935, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L174](prompt-folder-bootstrap.md#^ref-bd4f0976-174-0) (line 174, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L26](prompt-folder-bootstrap.md#^ref-bd4f0976-26-0) (line 26, col 0, score 0.59)
- [Prompt_Folder_Bootstrap — L52](prompt-folder-bootstrap.md#^ref-bd4f0976-52-0) (line 52, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L69](prompt-folder-bootstrap.md#^ref-bd4f0976-69-0) (line 69, col 0, score 0.59)
- [plan-update-confirmation — L27](plan-update-confirmation.md#^ref-b22d79c6-27-0) (line 27, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L134](prompt-folder-bootstrap.md#^ref-bd4f0976-134-0) (line 134, col 0, score 0.58)
- [sibilant-meta-string-templating-runtime — L73](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-73-0) (line 73, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L33](prompt-folder-bootstrap.md#^ref-bd4f0976-33-0) (line 33, col 0, score 0.58)
- [Shared Package Structure — L91](shared-package-structure.md#^ref-66a72fc3-91-0) (line 91, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L45](prompt-folder-bootstrap.md#^ref-bd4f0976-45-0) (line 45, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.55)
- [Sibilant Meta-Prompt DSL — L169](sibilant-meta-prompt-dsl.md#^ref-af5d2824-169-0) (line 169, col 0, score 0.56)
- [promethean-system-diagrams — L136](promethean-system-diagrams.md#^ref-b51e19b4-136-0) (line 136, col 0, score 0.6)
- [Reawakening Duck — L110](reawakening-duck.md#^ref-59b5670f-110-0) (line 110, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L149](sibilant-meta-prompt-dsl.md#^ref-af5d2824-149-0) (line 149, col 0, score 0.58)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.55)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.57)
- [promethean-system-diagrams — L78](promethean-system-diagrams.md#^ref-b51e19b4-78-0) (line 78, col 0, score 0.54)
- [Promethean Agent Config DSL — L109](promethean-agent-config-dsl.md#^ref-2c00ce45-109-0) (line 109, col 0, score 0.61)
- [Promethean Agent Config DSL — L259](promethean-agent-config-dsl.md#^ref-2c00ce45-259-0) (line 259, col 0, score 0.58)
- [Self-Agency in AI Interaction — L5](self-agency-in-ai-interaction.md#^ref-49a9a860-5-0) (line 5, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L133](prompt-folder-bootstrap.md#^ref-bd4f0976-133-0) (line 133, col 0, score 0.57)
- [promethean-system-diagrams — L180](promethean-system-diagrams.md#^ref-b51e19b4-180-0) (line 180, col 0, score 0.55)
- [sibilant-macro-targets — L95](sibilant-macro-targets.md#^ref-c5c9a5c6-95-0) (line 95, col 0, score 0.58)
- [The Jar of Echoes — L113](the-jar-of-echoes.md#^ref-18138627-113-0) (line 113, col 0, score 0.52)
- [Shared Package Structure — L139](shared-package-structure.md#^ref-66a72fc3-139-0) (line 139, col 0, score 0.56)
- [Reawakening Duck — L75](reawakening-duck.md#^ref-59b5670f-75-0) (line 75, col 0, score 0.56)
- [sibilant-meta-string-templating-runtime — L11](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-11-0) (line 11, col 0, score 0.55)
- [Protocol_0_The_Contradiction_Engine — L92](protocol-0-the-contradiction-engine.md#^ref-9a93a756-92-0) (line 92, col 0, score 0.55)
- [Factorio AI with External Agents — L24](factorio-ai-with-external-agents.md#^ref-a4d90289-24-0) (line 24, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.59)
- [mystery-lisp-search-session — L100](mystery-lisp-search-session.md#^ref-513dc4c7-100-0) (line 100, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L193](cross-language-runtime-polymorphism.md#^ref-c34c36a6-193-0) (line 193, col 0, score 0.59)
- [Factorio AI with External Agents — L90](factorio-ai-with-external-agents.md#^ref-a4d90289-90-0) (line 90, col 0, score 0.62)
- [typed-struct-compiler — L377](typed-struct-compiler.md#^ref-78eeedf7-377-0) (line 377, col 0, score 0.59)
- [Unique Info Dump Index — L8](unique-info-dump-index.md#^ref-30ec3ba6-8-0) (line 8, col 0, score 0.58)
- [mystery-lisp-search-session — L90](mystery-lisp-search-session.md#^ref-513dc4c7-90-0) (line 90, col 0, score 0.47)
- [Promethean Dev Workflow Update — L71](promethean-dev-workflow-update.md#^ref-03a5578f-71-0) (line 71, col 0, score 0.47)
- [Promethean State Format — L88](promethean-state-format.md#^ref-23df6ddb-88-0) (line 88, col 0, score 0.47)
- [promethean-system-diagrams — L211](promethean-system-diagrams.md#^ref-b51e19b4-211-0) (line 211, col 0, score 0.47)
- [Prompt_Folder_Bootstrap — L215](prompt-folder-bootstrap.md#^ref-bd4f0976-215-0) (line 215, col 0, score 0.47)
- [prompt-programming-language-lisp — L109](prompt-programming-language-lisp.md#^ref-d41a06d1-109-0) (line 109, col 0, score 0.47)
- [Recursive Prompt Construction Engine — L204](recursive-prompt-construction-engine.md#^ref-babdb9eb-204-0) (line 204, col 0, score 0.47)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [schema-evolution-workflow — L492](schema-evolution-workflow.md#^ref-d8059b6a-492-0) (line 492, col 0, score 0.47)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.59)
- [AI-Centric OS with MCP Layer — L384](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-384-0) (line 384, col 0, score 0.59)
- [infinite_depth_smoke_animation — L7](infinite-depth-smoke-animation.md#^ref-92a052a5-7-0) (line 7, col 0, score 0.58)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.58)
- [aionian-circuit-math — L88](aionian-circuit-math.md#^ref-f2d83a77-88-0) (line 88, col 0, score 0.57)
- [shared-package-layout-clarification — L5](shared-package-layout-clarification.md#^ref-36c8882a-5-0) (line 5, col 0, score 0.59)
- [Shared Package Structure — L38](shared-package-structure.md#^ref-66a72fc3-38-0) (line 38, col 0, score 0.57)
- [shared-package-layout-clarification — L114](shared-package-layout-clarification.md#^ref-36c8882a-114-0) (line 114, col 0, score 0.56)
- [Promethean Agent DSL TS Scaffold — L232](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-232-0) (line 232, col 0, score 0.54)
- [shared-package-layout-clarification — L120](shared-package-layout-clarification.md#^ref-36c8882a-120-0) (line 120, col 0, score 0.54)
- [Promethean Agent Config DSL — L117](promethean-agent-config-dsl.md#^ref-2c00ce45-117-0) (line 117, col 0, score 0.52)
- [Promethean Agent DSL TS Scaffold — L755](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-755-0) (line 755, col 0, score 0.51)
- [Prompt_Folder_Bootstrap — L105](prompt-folder-bootstrap.md#^ref-bd4f0976-105-0) (line 105, col 0, score 0.51)
- [Prompt_Folder_Bootstrap — L68](prompt-folder-bootstrap.md#^ref-bd4f0976-68-0) (line 68, col 0, score 0.51)
- [Promethean Agent DSL TS Scaffold — L735](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-735-0) (line 735, col 0, score 0.51)
- [Promethean Agent DSL TS Scaffold — L758](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-758-0) (line 758, col 0, score 0.5)
- [Agent Tasks: Persistence Migration to DualStore — L138](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-138-0) (line 138, col 0, score 0.55)
- [api-gateway-versioning — L291](api-gateway-versioning.md#^ref-0580dcd3-291-0) (line 291, col 0, score 0.55)
- [Board Automation Improvements — L21](board-automation-improvements.md#^ref-ac60a1d6-21-0) (line 21, col 0, score 0.55)
- [Board Walk – 2025-08-11 — L145](board-walk-2025-08-11.md#^ref-7aa1eb92-145-0) (line 145, col 0, score 0.55)
- [Chroma Toolkit Consolidation Plan — L176](chroma-toolkit-consolidation-plan.md#^ref-5020e892-176-0) (line 176, col 0, score 0.55)
- [DSL — L34](chunks/dsl.md#^ref-e87bc036-34-0) (line 34, col 0, score 0.55)
- [JavaScript — L13](chunks/javascript.md#^ref-c1618c66-13-0) (line 13, col 0, score 0.55)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.92)
- [Shared Package Structure — L103](shared-package-structure.md#^ref-66a72fc3-103-0) (line 103, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L247](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-247-0) (line 247, col 0, score 0.72)
- [Promethean-native config design — L297](promethean-native-config-design.md#^ref-ab748541-297-0) (line 297, col 0, score 0.7)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.69)
- [shared-package-layout-clarification — L11](shared-package-layout-clarification.md#^ref-36c8882a-11-0) (line 11, col 0, score 0.56)
- [Pure TypeScript Search Microservice — L155](pure-typescript-search-microservice.md#^ref-d17d3a96-155-0) (line 155, col 0, score 0.67)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L186](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-186-0) (line 186, col 0, score 0.67)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.66)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.67)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 0.63)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 0.63)
- [Interop and Source Maps — L534](interop-and-source-maps.md#^ref-cdfac40c-534-0) (line 534, col 0, score 0.63)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#^ref-cfee6d36-539-0) (line 539, col 0, score 0.63)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-412-0) (line 412, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L353](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-353-0) (line 353, col 0, score 0.63)
- [i3-bluetooth-setup — L15](i3-bluetooth-setup.md#^ref-5e408692-15-0) (line 15, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L80](board-walk-2025-08-11.md#^ref-7aa1eb92-80-0) (line 80, col 0, score 0.6)
- [ecs-offload-workers — L207](ecs-offload-workers.md#^ref-6498b9d7-207-0) (line 207, col 0, score 0.6)
- [The Jar of Echoes — L48](the-jar-of-echoes.md#^ref-18138627-48-0) (line 48, col 0, score 0.59)
- [heartbeat-simulation-snippets — L40](heartbeat-simulation-snippets.md#^ref-23e221e9-40-0) (line 40, col 0, score 0.59)
- [heartbeat-simulation-snippets — L53](heartbeat-simulation-snippets.md#^ref-23e221e9-53-0) (line 53, col 0, score 0.59)
- [Eidolon Field Abstract Model — L99](eidolon-field-abstract-model.md#^ref-5e8b2388-99-0) (line 99, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L182](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-182-0) (line 182, col 0, score 0.59)
- [Local-First Intention→Code Loop with Free Models — L118](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-118-0) (line 118, col 0, score 0.65)
- [Promethean Agent Config DSL — L123](promethean-agent-config-dsl.md#^ref-2c00ce45-123-0) (line 123, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.63)
- [Canonical Org-Babel Matplotlib Animation Template — L67](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-67-0) (line 67, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L358](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-358-0) (line 358, col 0, score 0.63)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L425](performance-optimized-polyglot-bridge.md#^ref-f5579967-425-0) (line 425, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L417](performance-optimized-polyglot-bridge.md#^ref-f5579967-417-0) (line 417, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L83](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-83-0) (line 83, col 0, score 0.75)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L15](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-15-0) (line 15, col 0, score 0.72)
- [Mongo Outbox Implementation — L544](mongo-outbox-implementation.md#^ref-9c1acd1e-544-0) (line 544, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L214](migrate-to-provider-tenant-architecture.md#^ref-54382370-214-0) (line 214, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.66)
- [Functional Embedding Pipeline Refactor — L304](functional-embedding-pipeline-refactor.md#^ref-a4a25141-304-0) (line 304, col 0, score 0.58)
- [field-interaction-equations — L126](field-interaction-equations.md#^ref-b09141b7-126-0) (line 126, col 0, score 0.65)
- [Event Bus MVP — L534](event-bus-mvp.md#^ref-534fe91d-534-0) (line 534, col 0, score 0.62)
- [api-gateway-versioning — L274](api-gateway-versioning.md#^ref-0580dcd3-274-0) (line 274, col 0, score 0.66)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.65)
- [js-to-lisp-reverse-compiler — L384](js-to-lisp-reverse-compiler.md#^ref-58191024-384-0) (line 384, col 0, score 0.64)
- [WebSocket Gateway Implementation — L443](websocket-gateway-implementation.md#^ref-e811123d-443-0) (line 443, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L136](migrate-to-provider-tenant-architecture.md#^ref-54382370-136-0) (line 136, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-149-0) (line 149, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L119](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-119-0) (line 119, col 0, score 0.6)
- [Promethean Infrastructure Setup — L551](promethean-infrastructure-setup.md#^ref-6deed6ac-551-0) (line 551, col 0, score 0.6)
- [WebSocket Gateway Implementation — L387](websocket-gateway-implementation.md#^ref-e811123d-387-0) (line 387, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L148](layer1survivabilityenvelope.md#^ref-64a9f9f9-148-0) (line 148, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L35](promethean-copilot-intent-engine.md#^ref-ae24a280-35-0) (line 35, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.59)
- [Fnord Tracer Protocol — L86](fnord-tracer-protocol.md#^ref-fc21f824-86-0) (line 86, col 0, score 0.59)
- [Board Walk – 2025-08-11 — L90](board-walk-2025-08-11.md#^ref-7aa1eb92-90-0) (line 90, col 0, score 0.59)
- [Exception Layer Analysis — L110](exception-layer-analysis.md#^ref-21d5cc09-110-0) (line 110, col 0, score 0.57)
- [AI-Centric OS with MCP Layer — L176](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-176-0) (line 176, col 0, score 0.6)
- [Board Walk – 2025-08-11 — L92](board-walk-2025-08-11.md#^ref-7aa1eb92-92-0) (line 92, col 0, score 0.59)
- [prom-lib-rate-limiters-and-replay-api — L88](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-88-0) (line 88, col 0, score 0.64)
- [Fnord Tracer Protocol — L142](fnord-tracer-protocol.md#^ref-fc21f824-142-0) (line 142, col 0, score 0.58)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L492](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-492-0) (line 492, col 0, score 0.57)
- [plan-update-confirmation — L353](plan-update-confirmation.md#^ref-b22d79c6-353-0) (line 353, col 0, score 0.57)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.56)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L412](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-412-0) (line 412, col 0, score 0.56)
- [The Jar of Echoes — L108](the-jar-of-echoes.md#^ref-18138627-108-0) (line 108, col 0, score 0.56)
- [Protocol_0_The_Contradiction_Engine — L107](protocol-0-the-contradiction-engine.md#^ref-9a93a756-107-0) (line 107, col 0, score 0.54)
- [Prompt_Folder_Bootstrap — L75](prompt-folder-bootstrap.md#^ref-bd4f0976-75-0) (line 75, col 0, score 0.53)
- [Prompt_Folder_Bootstrap — L107](prompt-folder-bootstrap.md#^ref-bd4f0976-107-0) (line 107, col 0, score 0.52)
- [Prompt_Folder_Bootstrap — L22](prompt-folder-bootstrap.md#^ref-bd4f0976-22-0) (line 22, col 0, score 0.52)
- [Promethean-native config design — L50](promethean-native-config-design.md#^ref-ab748541-50-0) (line 50, col 0, score 0.52)
- [Sibilant Meta-Prompt DSL — L4](sibilant-meta-prompt-dsl.md#^ref-af5d2824-4-0) (line 4, col 0, score 0.51)
- [Reawakening Duck — L34](reawakening-duck.md#^ref-59b5670f-34-0) (line 34, col 0, score 0.51)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.63)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.58)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.65)
- [Post-Linguistic Transhuman Design Frameworks — L71](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-71-0) (line 71, col 0, score 0.59)
- [WebSocket Gateway Implementation — L379](websocket-gateway-implementation.md#^ref-e811123d-379-0) (line 379, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L17](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-17-0) (line 17, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L154](dynamic-context-model-for-web-components.md#^ref-f7702bf8-154-0) (line 154, col 0, score 0.59)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L330](dynamic-context-model-for-web-components.md#^ref-f7702bf8-330-0) (line 330, col 0, score 0.66)
- [Duck's Self-Referential Perceptual Loop — L6](ducks-self-referential-perceptual-loop.md#^ref-71726f04-6-0) (line 6, col 0, score 0.67)
- [homeostasis-decay-formulas — L130](homeostasis-decay-formulas.md#^ref-37b5d236-130-0) (line 130, col 0, score 0.66)
- [Model Upgrade Calm-Down Guide — L42](model-upgrade-calm-down-guide.md#^ref-db74343f-42-0) (line 42, col 0, score 0.65)
- [Reawakening Duck — L32](reawakening-duck.md#^ref-59b5670f-32-0) (line 32, col 0, score 0.65)
- [Board Walk – 2025-08-11 — L93](board-walk-2025-08-11.md#^ref-7aa1eb92-93-0) (line 93, col 0, score 0.65)
- [Duck's Attractor States — L44](ducks-attractor-states.md#^ref-13951643-44-0) (line 44, col 0, score 0.66)
- [Provider-Agnostic Chat Panel Implementation — L176](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-176-0) (line 176, col 0, score 0.65)
- [Local-Offline-Model-Deployment-Strategy — L292](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-292-0) (line 292, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L798](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-798-0) (line 798, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L252](migrate-to-provider-tenant-architecture.md#^ref-54382370-252-0) (line 252, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L632](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-632-0) (line 632, col 0, score 0.67)
- [Recursive Prompt Construction Engine — L41](recursive-prompt-construction-engine.md#^ref-babdb9eb-41-0) (line 41, col 0, score 0.66)
- [Promethean Agent Config DSL — L125](promethean-agent-config-dsl.md#^ref-2c00ce45-125-0) (line 125, col 0, score 0.66)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.65)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.82)
- [Migrate to Provider-Tenant Architecture — L220](migrate-to-provider-tenant-architecture.md#^ref-54382370-220-0) (line 220, col 0, score 0.62)
- [observability-infrastructure-setup — L334](observability-infrastructure-setup.md#^ref-b4e64f8c-334-0) (line 334, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L39](dynamic-context-model-for-web-components.md#^ref-f7702bf8-39-0) (line 39, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L24](migrate-to-provider-tenant-architecture.md#^ref-54382370-24-0) (line 24, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L73](dynamic-context-model-for-web-components.md#^ref-f7702bf8-73-0) (line 73, col 0, score 0.57)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.58)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L378](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-378-0) (line 378, col 0, score 0.61)
- [Local-Offline-Model-Deployment-Strategy — L80](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-80-0) (line 80, col 0, score 0.6)
- [Promethean-native config design — L81](promethean-native-config-design.md#^ref-ab748541-81-0) (line 81, col 0, score 0.6)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.6)
- [Cross-Language Runtime Polymorphism — L1](cross-language-runtime-polymorphism.md#^ref-c34c36a6-1-0) (line 1, col 0, score 0.59)
- [Exception Layer Analysis — L60](exception-layer-analysis.md#^ref-21d5cc09-60-0) (line 60, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L63](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-63-0) (line 63, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L141](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-141-0) (line 141, col 0, score 0.6)
- [Mongo Outbox Implementation — L284](mongo-outbox-implementation.md#^ref-9c1acd1e-284-0) (line 284, col 0, score 0.58)
- [Exception Layer Analysis — L62](exception-layer-analysis.md#^ref-21d5cc09-62-0) (line 62, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L122](prompt-folder-bootstrap.md#^ref-bd4f0976-122-0) (line 122, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L104](migrate-to-provider-tenant-architecture.md#^ref-54382370-104-0) (line 104, col 0, score 0.57)
- [Migrate to Provider-Tenant Architecture — L170](migrate-to-provider-tenant-architecture.md#^ref-54382370-170-0) (line 170, col 0, score 0.57)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.56)
- [Debugging Broker Connections and Agent Behavior — L13](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-13-0) (line 13, col 0, score 0.71)
- [Layer1SurvivabilityEnvelope — L156](layer1survivabilityenvelope.md#^ref-64a9f9f9-156-0) (line 156, col 0, score 0.7)
- [Duck's Self-Referential Perceptual Loop — L1](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1-0) (line 1, col 0, score 0.68)
- [Reawakening Duck — L9](reawakening-duck.md#^ref-59b5670f-9-0) (line 9, col 0, score 0.66)
- [Duck's Self-Referential Perceptual Loop — L29](ducks-self-referential-perceptual-loop.md#^ref-71726f04-29-0) (line 29, col 0, score 0.66)
- [api-gateway-versioning — L275](api-gateway-versioning.md#^ref-0580dcd3-275-0) (line 275, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 0.65)
- [Promethean Infrastructure Setup — L552](promethean-infrastructure-setup.md#^ref-6deed6ac-552-0) (line 552, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L62](migrate-to-provider-tenant-architecture.md#^ref-54382370-62-0) (line 62, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L254](migrate-to-provider-tenant-architecture.md#^ref-54382370-254-0) (line 254, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 0.66)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 0.66)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.63)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L371](dynamic-context-model-for-web-components.md#^ref-f7702bf8-371-0) (line 371, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L3](chroma-embedding-refactor.md#^ref-8b256935-3-0) (line 3, col 0, score 0.6)
- [markdown-to-org-transpiler — L294](markdown-to-org-transpiler.md#^ref-ab54cdd8-294-0) (line 294, col 0, score 0.6)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.71)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.71)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.71)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.71)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 0.71)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.7)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.67)
- [ParticleSimulationWithCanvasAndFFmpeg — L231](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-231-0) (line 231, col 0, score 0.65)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.64)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.63)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.61)
- [ts-to-lisp-transpiler — L5](ts-to-lisp-transpiler.md#^ref-ba11486b-5-0) (line 5, col 0, score 0.6)
- [Promethean Pipelines — L48](promethean-pipelines.md#^ref-8b8e6103-48-0) (line 48, col 0, score 0.59)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.59)
- [polymorphic-meta-programming-engine — L188](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-188-0) (line 188, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.75)
- [Promethean Event Bus MVP v0.1 — L106](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-106-0) (line 106, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L110](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-110-0) (line 110, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L285](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-285-0) (line 285, col 0, score 0.67)
- [Fnord Tracer Protocol — L205](fnord-tracer-protocol.md#^ref-fc21f824-205-0) (line 205, col 0, score 0.67)
- [Event Bus MVP — L390](event-bus-mvp.md#^ref-534fe91d-390-0) (line 390, col 0, score 0.84)
- [Promethean Event Bus MVP v0.1 — L855](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-855-0) (line 855, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L311](chroma-embedding-refactor.md#^ref-8b256935-311-0) (line 311, col 0, score 0.82)
- [eidolon-node-lifecycle — L21](eidolon-node-lifecycle.md#^ref-938eca9c-21-0) (line 21, col 0, score 0.75)
- [Factorio AI with External Agents — L141](factorio-ai-with-external-agents.md#^ref-a4d90289-141-0) (line 141, col 0, score 0.74)
- [Promethean-native config design — L380](promethean-native-config-design.md#^ref-ab748541-380-0) (line 380, col 0, score 0.73)
- [Promethean-Copilot-Intent-Engine — L4](promethean-copilot-intent-engine.md#^ref-ae24a280-4-0) (line 4, col 0, score 0.72)
- [Model Upgrade Calm-Down Guide — L60](model-upgrade-calm-down-guide.md#^ref-db74343f-60-0) (line 60, col 0, score 0.72)
- [Model Upgrade Calm-Down Guide — L29](model-upgrade-calm-down-guide.md#^ref-db74343f-29-0) (line 29, col 0, score 0.71)
- [WebSocket Gateway Implementation — L615](websocket-gateway-implementation.md#^ref-e811123d-615-0) (line 615, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L326](chroma-embedding-refactor.md#^ref-8b256935-326-0) (line 326, col 0, score 1)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L489](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-489-0) (line 489, col 0, score 1)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#^ref-2c00ce45-326-0) (line 326, col 0, score 1)
- [Promethean Infrastructure Setup — L579](promethean-infrastructure-setup.md#^ref-6deed6ac-579-0) (line 579, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L441](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-441-0) (line 441, col 0, score 1)
- [shared-package-layout-clarification — L164](shared-package-layout-clarification.md#^ref-36c8882a-164-0) (line 164, col 0, score 1)
- [Tooling — L13](chunks/tooling.md#^ref-6cb4943e-13-0) (line 13, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L205](cross-language-runtime-polymorphism.md#^ref-c34c36a6-205-0) (line 205, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L144](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-144-0) (line 144, col 0, score 1)
- [Local-Only-LLM-Workflow — L194](local-only-llm-workflow.md#^ref-9a8ab57e-194-0) (line 194, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L320](migrate-to-provider-tenant-architecture.md#^ref-54382370-320-0) (line 320, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L50](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-50-0) (line 50, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L188](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-188-0) (line 188, col 0, score 1)
- [polyglot-repl-interface-layer — L173](polyglot-repl-interface-layer.md#^ref-9c79206d-173-0) (line 173, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [2d-sandbox-field — L193](2d-sandbox-field.md#^ref-c710dc93-193-0) (line 193, col 0, score 1)
- [Eidolon Field Abstract Model — L190](eidolon-field-abstract-model.md#^ref-5e8b2388-190-0) (line 190, col 0, score 1)
- [EidolonField — L242](eidolonfield.md#^ref-49d1e1e5-242-0) (line 242, col 0, score 1)
- [Exception Layer Analysis — L145](exception-layer-analysis.md#^ref-21d5cc09-145-0) (line 145, col 0, score 1)
- [field-dynamics-math-blocks — L144](field-dynamics-math-blocks.md#^ref-7cfc230d-144-0) (line 144, col 0, score 1)
- [field-node-diagram-outline — L105](field-node-diagram-outline.md#^ref-1f32c94a-105-0) (line 105, col 0, score 1)
- [Ice Box Reorganization — L69](ice-box-reorganization.md#^ref-291c7d91-69-0) (line 69, col 0, score 1)
- [js-to-lisp-reverse-compiler — L417](js-to-lisp-reverse-compiler.md#^ref-58191024-417-0) (line 417, col 0, score 1)
- [api-gateway-versioning — L299](api-gateway-versioning.md#^ref-0580dcd3-299-0) (line 299, col 0, score 1)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Agent Config DSL — L358](promethean-agent-config-dsl.md#^ref-2c00ce45-358-0) (line 358, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [js-to-lisp-reverse-compiler — L418](js-to-lisp-reverse-compiler.md#^ref-58191024-418-0) (line 418, col 0, score 1)
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [aionian-circuit-math — L169](aionian-circuit-math.md#^ref-f2d83a77-169-0) (line 169, col 0, score 1)
- [api-gateway-versioning — L290](api-gateway-versioning.md#^ref-0580dcd3-290-0) (line 290, col 0, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#^ref-7aa1eb92-135-0) (line 135, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L180](chroma-toolkit-consolidation-plan.md#^ref-5020e892-180-0) (line 180, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L185](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-185-0) (line 185, col 0, score 1)
- [Dynamic Context Model for Web Components — L402](dynamic-context-model-for-web-components.md#^ref-f7702bf8-402-0) (line 402, col 0, score 1)
- [Eidolon Field Abstract Model — L191](eidolon-field-abstract-model.md#^ref-5e8b2388-191-0) (line 191, col 0, score 1)
- [eidolon-node-lifecycle — L53](eidolon-node-lifecycle.md#^ref-938eca9c-53-0) (line 53, col 0, score 1)
- [EidolonField — L243](eidolonfield.md#^ref-49d1e1e5-243-0) (line 243, col 0, score 1)
- [field-dynamics-math-blocks — L145](field-dynamics-math-blocks.md#^ref-7cfc230d-145-0) (line 145, col 0, score 1)
- [Diagrams — L26](chunks/diagrams.md#^ref-45cd25b5-26-0) (line 26, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#^ref-54382370-295-0) (line 295, col 0, score 1)
- [Promethean Agent Config DSL — L316](promethean-agent-config-dsl.md#^ref-2c00ce45-316-0) (line 316, col 0, score 1)
- [Promethean Infrastructure Setup — L589](promethean-infrastructure-setup.md#^ref-6deed6ac-589-0) (line 589, col 0, score 1)
- [shared-package-layout-clarification — L173](shared-package-layout-clarification.md#^ref-36c8882a-173-0) (line 173, col 0, score 1)
- [Shared Package Structure — L165](shared-package-structure.md#^ref-66a72fc3-165-0) (line 165, col 0, score 1)
- [Unique Info Dump Index — L140](unique-info-dump-index.md#^ref-30ec3ba6-140-0) (line 140, col 0, score 1)
- [WebSocket Gateway Implementation — L640](websocket-gateway-implementation.md#^ref-e811123d-640-0) (line 640, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [2d-sandbox-field — L194](2d-sandbox-field.md#^ref-c710dc93-194-0) (line 194, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#^ref-5020e892-194-0) (line 194, col 0, score 1)
- [Diagrams — L41](chunks/diagrams.md#^ref-45cd25b5-41-0) (line 41, col 0, score 1)
- [Math Fundamentals — L29](chunks/math-fundamentals.md#^ref-c6e87433-29-0) (line 29, col 0, score 1)
- [compiler-kit-foundations — L649](compiler-kit-foundations.md#^ref-01b21543-649-0) (line 649, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L225](cross-language-runtime-polymorphism.md#^ref-c34c36a6-225-0) (line 225, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L192](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-192-0) (line 192, col 0, score 1)
- [Duck's Attractor States — L74](ducks-attractor-states.md#^ref-13951643-74-0) (line 74, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L47](ducks-self-referential-perceptual-loop.md#^ref-71726f04-47-0) (line 47, col 0, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#^ref-5e8b2388-195-0) (line 195, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 1)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L405](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-405-0) (line 405, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [i3-config-validation-methods — L60](i3-config-validation-methods.md#^ref-d28090ac-60-0) (line 60, col 0, score 1)
- [Local-Only-LLM-Workflow — L193](local-only-llm-workflow.md#^ref-9a8ab57e-193-0) (line 193, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L310](migrate-to-provider-tenant-architecture.md#^ref-54382370-310-0) (line 310, col 0, score 1)
- [observability-infrastructure-setup — L400](observability-infrastructure-setup.md#^ref-b4e64f8c-400-0) (line 400, col 0, score 1)
- [Promethean Infrastructure Setup — L604](promethean-infrastructure-setup.md#^ref-6deed6ac-604-0) (line 604, col 0, score 1)
- [Promethean Web UI Setup — L615](promethean-web-ui-setup.md#^ref-bc5172ca-615-0) (line 615, col 0, score 1)
- [Pure TypeScript Search Microservice — L536](pure-typescript-search-microservice.md#^ref-d17d3a96-536-0) (line 536, col 0, score 1)
- [shared-package-layout-clarification — L169](shared-package-layout-clarification.md#^ref-36c8882a-169-0) (line 169, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Event Bus MVP — L558](event-bus-mvp.md#^ref-534fe91d-558-0) (line 558, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [Tooling — L7](chunks/tooling.md#^ref-6cb4943e-7-0) (line 7, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L227](cross-language-runtime-polymorphism.md#^ref-c34c36a6-227-0) (line 227, col 0, score 1)
- [ecs-scheduler-and-prefabs — L421](ecs-scheduler-and-prefabs.md#^ref-c62a1815-421-0) (line 421, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L156](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-156-0) (line 156, col 0, score 1)
- [pm2-orchestration-patterns — L250](pm2-orchestration-patterns.md#^ref-51932e7b-250-0) (line 250, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L532](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-532-0) (line 532, col 0, score 1)
- [polymorphic-meta-programming-engine — L226](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-226-0) (line 226, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L920](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-920-0) (line 920, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-159-0) (line 159, col 0, score 1)
- [AI-Centric OS with MCP Layer — L400](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-400-0) (line 400, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#^ref-5020e892-197-0) (line 197, col 0, score 1)
- [Diagrams — L45](chunks/diagrams.md#^ref-45cd25b5-45-0) (line 45, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L222](cross-language-runtime-polymorphism.md#^ref-c34c36a6-222-0) (line 222, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L167](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-167-0) (line 167, col 0, score 1)
- [Dynamic Context Model for Web Components — L385](dynamic-context-model-for-web-components.md#^ref-f7702bf8-385-0) (line 385, col 0, score 1)
- [i3-config-validation-methods — L86](i3-config-validation-methods.md#^ref-d28090ac-86-0) (line 86, col 0, score 1)
- [js-to-lisp-reverse-compiler — L408](js-to-lisp-reverse-compiler.md#^ref-58191024-408-0) (line 408, col 0, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#^ref-cfee6d36-542-0) (line 542, col 0, score 1)
- [lisp-dsl-for-window-management — L227](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-227-0) (line 227, col 0, score 1)
- [aionian-circuit-math — L152](aionian-circuit-math.md#^ref-f2d83a77-152-0) (line 152, col 0, score 1)
- [Math Fundamentals — L11](chunks/math-fundamentals.md#^ref-c6e87433-11-0) (line 11, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L196](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-196-0) (line 196, col 0, score 1)
- [Eidolon Field Abstract Model — L192](eidolon-field-abstract-model.md#^ref-5e8b2388-192-0) (line 192, col 0, score 1)
- [eidolon-field-math-foundations — L121](eidolon-field-math-foundations.md#^ref-008f2ac0-121-0) (line 121, col 0, score 1)
- [EidolonField — L245](eidolonfield.md#^ref-49d1e1e5-245-0) (line 245, col 0, score 1)
- [Exception Layer Analysis — L149](exception-layer-analysis.md#^ref-21d5cc09-149-0) (line 149, col 0, score 1)
- [field-interaction-equations — L149](field-interaction-equations.md#^ref-b09141b7-149-0) (line 149, col 0, score 1)
- [field-node-diagram-outline — L103](field-node-diagram-outline.md#^ref-1f32c94a-103-0) (line 103, col 0, score 1)
- [2d-sandbox-field — L196](2d-sandbox-field.md#^ref-c710dc93-196-0) (line 196, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L137](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-137-0) (line 137, col 0, score 1)
- [Diagrams — L34](chunks/diagrams.md#^ref-45cd25b5-34-0) (line 34, col 0, score 1)
- [JavaScript — L46](chunks/javascript.md#^ref-c1618c66-46-0) (line 46, col 0, score 1)
- [Math Fundamentals — L41](chunks/math-fundamentals.md#^ref-c6e87433-41-0) (line 41, col 0, score 1)
- [Simulation Demo — L16](chunks/simulation-demo.md#^ref-557309a3-16-0) (line 16, col 0, score 1)
- [Duck's Attractor States — L75](ducks-attractor-states.md#^ref-13951643-75-0) (line 75, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L48](ducks-self-referential-perceptual-loop.md#^ref-71726f04-48-0) (line 48, col 0, score 1)
- [Eidolon Field Abstract Model — L193](eidolon-field-abstract-model.md#^ref-5e8b2388-193-0) (line 193, col 0, score 1)
- [eidolon-field-math-foundations — L135](eidolon-field-math-foundations.md#^ref-008f2ac0-135-0) (line 135, col 0, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#^ref-5e8b2388-194-0) (line 194, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [EidolonField — L247](eidolonfield.md#^ref-49d1e1e5-247-0) (line 247, col 0, score 1)
- [Event Bus MVP — L580](event-bus-mvp.md#^ref-534fe91d-580-0) (line 580, col 0, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#^ref-cf6b9b17-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L182](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-182-0) (line 182, col 0, score 1)
- [aionian-circuit-math — L184](aionian-circuit-math.md#^ref-f2d83a77-184-0) (line 184, col 0, score 1)
- [Board Walk – 2025-08-11 — L154](board-walk-2025-08-11.md#^ref-7aa1eb92-154-0) (line 154, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L208](chroma-toolkit-consolidation-plan.md#^ref-5020e892-208-0) (line 208, col 0, score 1)
- [Dynamic Context Model for Web Components — L437](dynamic-context-model-for-web-components.md#^ref-f7702bf8-437-0) (line 437, col 0, score 1)
- [eidolon-field-math-foundations — L175](eidolon-field-math-foundations.md#^ref-008f2ac0-175-0) (line 175, col 0, score 1)
- [eidolon-node-lifecycle — L64](eidolon-node-lifecycle.md#^ref-938eca9c-64-0) (line 64, col 0, score 1)
- [Exception Layer Analysis — L173](exception-layer-analysis.md#^ref-21d5cc09-173-0) (line 173, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
