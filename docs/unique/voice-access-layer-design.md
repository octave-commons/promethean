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
related_to_title:
  - Shared Package Structure
  - Universal Lisp Interface
  - Chroma Toolkit Consolidation Plan
  - Vectorial Exception Descent
  - Promethean-native config design
  - Migrate to Provider-Tenant Architecture
  - Dynamic Context Model for Web Components
  - Event Bus MVP
  - Local-First Intention→Code Loop with Free Models
  - shared-package-layout-clarification
  - Promethean Event Bus MVP v0.1
  - Cross-Target Macro System in Sibilant
  - aionian-circuit-math
  - Promethean Infrastructure Setup
  - template-based-compilation
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Eidolon Field Abstract Model
  - Exception Layer Analysis
  - Promethean Agent DSL TS Scaffold
  - Board Walk – 2025-08-11
  - api-gateway-versioning
  - 2d-sandbox-field
  - EidolonField
  - prom-lib-rate-limiters-and-replay-api
  - schema-evolution-workflow
  - Prompt_Folder_Bootstrap
  - Mongo Outbox Implementation
  - Post-Linguistic Transhuman Design Frameworks
  - Local-Only-LLM-Workflow
  - i3-config-validation-methods
  - Event Bus Projections Architecture
  - Cross-Language Runtime Polymorphism
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - obsidian-ignore-node-modules-regex
  - Sibilant Meta-Prompt DSL
  - Model Selection for Lightweight Conversational Tasks
  - Promethean Agent Config DSL
  - field-dynamics-math-blocks
  - field-node-diagram-outline
  - layer-1-uptime-diagrams
  - polymorphic-meta-programming-engine
related_to_uuid:
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 54382370-1931-4a19-a634-46735708a9ea
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - d28090ac-f746-4958-aab5-ed1315382c04
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - af5d2824-faad-476c-a389-e912d9bc672c
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
references: []
---
Short version: it lines up cleanly if you treat **voice** like the gateway/rest split—but for **RTP/UDP**. Put all Discord-specific sockets, SSRC/SRTP keys, and Opus decode **inside a “voice access” agent** per (provider, tenant). Everything after that is boring, tokenless DSP workers (VAD → chunker → STT → LLM → TTS → playback), same envelope and topic rules.

Here’s the concrete carve-up.

# 1) Voice Access Layer (tokened, per provider+tenant)

### Responsibilities

* Join/leave voice channels (Discord voice WebSocket + UDP).
* Manage **voice server state**: endpoint, session\_id, token, SSRCs, ssrc→user\_id map, secret key.
* Handle **RTP** receive: decode Opus → uniform PCM frames.
* Handle **RTP** send: accept PCM/Opus frames and transmit back to Discord.
* Emit precise timing/health (ping, jitter, packet loss, clock skew).

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

### Envelopes (payload sketches)

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
```

> All the SRTP voodoo stays in **providers/discord/voice-access**. Downstream never needs tokens or SSRC secrets.

# 2) DSP & AI Workers (tokenless, tenant-aware)

These are just subscribers to `voice.audio.pcm` and publishers of higher-level events. They remain **provider-agnostic**.

### Recommended pipeline (each step is a separate worker):

1. **VAD + Chunker**

   * **In:** `voice.audio.pcm`
   * **Out:** `voice.audio.segment` (PCM slices with start/end)
   * Payload adds `segment_id`, `ts_start`, `ts_end`, `energy_rms`, `snr`.

2. **Spectrogram**

   * **In:** `voice.audio.segment`
   * **Out:** `voice.audio.spectrogram`
   * Payload fields: `{ image_path?, mel_npz_path, n_mels, hop_length, win_length }`
   * This is where your spectrogram visualizations & analysis live—no provider logic.

3. **STT**

   * **In:** `voice.audio.segment` (or `spectrogram` if your model consumes mels)
   * **Out:** `duck.transcript.segment` (what we specced earlier)
   * Track `rtf` (real-time factor), `confidence`, token counts.

4. **LLM (Cephalon-Social)**

   * **In:** `duck.transcript.segment`
   * **Out:** `duck.reply.message` and a **provider-agnostic command** `social.command.post` (see below)
   * Also emit `voice.intent` if you split intents (e.g., “play soundboard”, “do TTS reply”).

5. **TTS**

   * **In:** `duck.reply.message`
   * **Out:** `voice.play.pcm` (or `voice.play.opus`)

Everything above is tokenless and references **`provider` + `tenant`** only for routing and storage namespaces.

### Topics for DSP

```
promethean.p.*.t.*.voice.audio.segment
promethean.p.*.t.*.voice.audio.spectrogram
promethean.p.*.t.*.duck.transcript.segment
promethean.p.*.t.*.duck.reply.message
```

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
  }
}
```

# 3) Non-REST tenant stuff (fits under “provider access” too)

“Non-REST” basically means **anything that needs provider credentials or sockets**:

* Voice gateways & UDP (covered).
* Webhook/WebSocket firehoses (e.g., Twitch EventSub over WS, Bluesky firehose).
* OAuth refresh/PKCE for providers (store in **Provider Registry**, not in workers).
* Any **provider-specific crypto** (e.g., Discord SRTP key derivation).

Rule of thumb: if it requires **provider keys or handshakes**, put it in `shared/ts/src/providers/<provider>/*` helpers and the corresponding **access agent**. Publish normalized events to the bus; keep workers blind to the provider details.

# 4) Where code lives in your namespaced shared lib

* `providers/discord/voice/` (helpers used only by the voice access agent)

  * `gateway.ts` (voice WS handshake, resume, heartbeats)
  * `rtp.ts` (Opus decode/encode, jitter buffer)
  * `normalize.ts` (user\_id/ssrc mapping)
  * `health.ts` (jitter/packet-loss calc)

**Access agent** imports those, not your workers.

Workers import only `@shared/ts/dist/platform/*` and `effects/*`.

# 5) Policy & Capabilities (voice)

Add provider-parametric voice caps—only access agents are allowed:

```ts
// src/agent/policy.ts
export type Capability =
  | { kind:"provider.gateway.connect"; provider:string; tenant:string }
  | { kind:"provider.rest.call";      provider:string; tenant:string; route:string }
  | { kind:"provider.voice.connect";  provider:string; tenant:string; guild_id:string; channel_id:string }
  | { kind:"provider.voice.send";     provider:string; tenant:string; guild_id:string; channel_id:string }
  | { kind:"storage.mongo"; db:string; coll:string }
  | { kind:"embed.text"; model:string }
  | { kind:"embed.image"; model:string }
  | { kind:"http.fetch"; url:string; method?:string };
```

Workers never need `provider.voice.*`.

# 6) Clocking, latency, and backpressure (don’t skip)

* **Clock domain:** carry `ts_monotonic_ns` with every audio frame and segment. Don’t trust wall clock for ordering.
* **Frame spec:** standardize on 20 ms hop (960 samples @ 48 kHz) for PCM frames upstream; resample at access if needed.
* **Backpressure:** if downstream lags, the **voice access** agent must:

  * drop or downsample (emit `DEGRADED` health),
  * expose queue depth metrics,
  * never block RTP receive (you’ll drift or get kicked).

# 7) Playback arbitration

When both TTS and other audio compete:

* Have a **voice-mixer** worker (tokenless) that:

  * **In:** `voice.play.pcm` events (from TTS or SFX)
  * **Out:** **one** ordered stream to access (`voice.play.pcm.out`)
  * Does ducking/mixing/fades, enforces a single playback queue per session.

# 8) “Post a text reply” without touching Discord in workers

Use the provider-agnostic command you already planned:

```
promethean.p.<provider>.t.<tenant>.social.command.post
{
  provider, tenant,
  space_urn: "urn:discord:channel:duck:123...",
  in_reply_to?: "urn:discord:message:duck:456...",
  text, attachments:[]
}
```

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
    - topic: promethean.p.discord.t.*.voice.health
    - topic: promethean.p.discord.t.*.voice.audio.(rtp|pcm)
  capabilities:
    - provider.voice.connect: {}
    - provider.voice.send: {}
```

```yaml
# services/ts/vad-chunker/agent.yml
agent:
  id: vad-chunker
  kind: dsp
  version: 0.1.0
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
  inputs:
    - topic: promethean.p.*.t.*.voice.audio.segment
  outputs:
    - topic: promethean.p.*.t.*.voice.audio.spectrogram
```

# 10) How it plugs into what you already have

* Your **OpenVINO Whisper** sits in the STT worker, subscribed to `voice.audio.segment`. No token leakage.
* Your **spectrogram renderer** becomes its own worker; it can store PNG/NPZ to `/var/promethean/tmp/**` (policy-gated).
* Your **existing TTS** publishes `voice.play.pcm`; access agent handles Opus encode + RTP.
* Duck’s **text chat** path is unchanged; it’s just another event source (normalized `SocialMessageCreated`) that can also trigger TTS.

---

## Bottom line

* All **tenant-specific, non-REST** plumbing (voice sockets, SRTP, jitter) lives in a **voice access agent** per provider/tenant.
* **Everything audio/ML** downstream is **provider-agnostic** and tokenless, glued by the same envelope + topics you’ve already adopted.
* This generalizes to Twitch voice/video or Reddit streams by swapping the **access** adapter, not your DSP pipeline.

If you want, I can extend the zip with:

* `providers/discord/voice/` stubs (ws handshake, rtp codec interfaces),
* the topic constants under `platform/topic.ts`,
* and skeleton manifests for `discord-voice-access`, `vad-chunker`, `spectrogram`, `stt-whisper`, `voice-mixer`.

\#hashtags
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
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
