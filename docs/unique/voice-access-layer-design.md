---
uuid: 73d64bce-f428-4735-a3d0-6225a0588e46
created_at: voice-access-layer-design.md
filename: Voice Access Layer Design
title: Voice Access Layer Design
description: >-
  This document outlines a tokenized voice access layer for Discord that handles
  voice channel management, RTP processing, and state tracking. It separates
  voice-specific operations into a secure provider-tenant scoped agent while
  keeping downstream DSP and AI workers tokenless and provider-agnostic.
tags:
  - voice
  - discord
  - rtp
  - tokenization
  - ssrc
  - opus
  - dsp
  - ai
related_to_uuid:
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 9b694a91-dec5-4708-9462-3f71000ba925
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
related_to_title:
  - Pure TypeScript Search Microservice
  - ParticleSimulationWithCanvasAndFFmpeg
  - obsidian-ignore-node-modules-regex
  - Provider-Agnostic Chat Panel Implementation
  - Obsidian ChatGPT Plugin Integration
  - Obsidian Templating Plugins Integration Guide
  - Optimizing Command Limitations in System Design
  - Obsidian Task Generation
  - OpenAPI Validation Report
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Agent Reflections and Prompt Evolution
  - ChatGPT Custom Prompts
  - Chroma Toolkit Consolidation Plan
  - typed-struct-compiler
references:
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 618
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 187
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 999
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 57
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 131
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 88
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 134
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 48
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 125
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 304
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 289
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 616
    col: 0
    score: 1
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 106
    col: 0
    score: 0.9
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 523
    col: 0
    score: 0.9
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 220
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 148
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 132
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 160
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 229
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 251
    col: 0
    score: 0.89
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 185
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4827
    col: 0
    score: 0.89
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 4557
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 8353
    col: 0
    score: 0.89
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 2598
    col: 0
    score: 0.89
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 5476
    col: 0
    score: 0.89
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 6064
    col: 0
    score: 0.89
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 6381
    col: 0
    score: 0.89
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 4172
    col: 0
    score: 0.89
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 4019
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 207
    col: 0
    score: 0.88
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 237
    col: 0
    score: 0.88
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 185
    col: 0
    score: 0.88
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 170
    col: 0
    score: 0.88
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 175
    col: 0
    score: 0.87
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 127
    col: 0
    score: 0.87
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 376
    col: 0
    score: 0.87
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 383
    col: 0
    score: 0.86
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 161
    col: 0
    score: 0.86
  - uuid: b51e19b4-1326-4311-9798-33e972bf626c
    line: 169
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 857
    col: 0
    score: 0.86
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 660
    col: 0
    score: 0.86
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 732
    col: 0
    score: 0.86
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 692
    col: 0
    score: 0.86
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1247
    col: 0
    score: 0.86
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 527
    col: 0
    score: 0.86
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 698
    col: 0
    score: 0.86
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 54
    col: 0
    score: 0.85
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 340
    col: 0
    score: 0.85
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 69
    col: 0
    score: 0.85
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 100
    col: 0
    score: 0.85
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 189
    col: 0
    score: 0.85
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 50
    col: 0
    score: 0.85
  - uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
    line: 217
    col: 0
    score: 0.85
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 84
    col: 0
    score: 0.85
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 442
    col: 0
    score: 0.85
---
Short version: it lines up cleanly if you treat **voice** like the gateway/rest split—but for **RTP/UDP**. Put all Discord-specific sockets, SSRC/SRTP keys, and Opus decode **inside a “voice access” agent** per (provider, tenant). Everything after that is boring, tokenless DSP workers (VAD → chunker → STT → LLM → TTS → playback), same envelope and topic rules. ^ref-543ed9b3-1-0

Here’s the concrete carve-up. ^ref-543ed9b3-3-0

# 1) Voice Access Layer (tokened, per provider+tenant)

### Responsibilities

* Join/leave voice channels (Discord voice WebSocket + UDP). ^ref-543ed9b3-9-0
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
^ref-543ed9b3-17-0 ^ref-543ed9b3-35-0

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
^ref-543ed9b3-280-0
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
\#promethean #discord #voice #rtp #opus #vad #spectrogram #stt #tts #access-layer #provider-agnostic #tenant #event-driven #typescript #openvino
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
^ref-543ed9b3-280-0
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
\#promethean #discord #voice #rtp #opus #vad #spectrogram #stt #tts #access-layer #provider-agnostic #tenant #event-driven #typescript #openvino
