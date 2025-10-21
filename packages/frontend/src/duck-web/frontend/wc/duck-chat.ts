import {
  PCM48_STEREO_CHANNELS,
  PCM48_TO_16_DECIMATION,
  averageStereoFrame,
  floatToPcm16,
} from '@promethean/duck-audio';

const $ = (sel: string, root: ParentNode = document) =>
  root.querySelector(sel) as HTMLElement | null;
const nowIso = () => new Date().toISOString();

// --- Audio utilities -------------------------------------------------------
const downsampleTo16kMono = async (source: MediaStream): Promise<ReadableStream<Uint8Array>> => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 48000,
  });
  const srcNode = audioCtx.createMediaStreamSource(source);
  const processor = audioCtx.createScriptProcessor(4096, 2, 1);
  srcNode.connect(processor);
  processor.connect(audioCtx.destination); // some browsers require destination

  const reader = new ReadableStream<Uint8Array>({
    start(controller) {
      processor.onaudioprocess = (e) => {
        const l = e.inputBuffer.getChannelData(0);
        const r = e.inputBuffer.getChannelData(1) ?? l;
        // simple box decimation to 16k mono, 20ms frames => 320 samples/frame
        const samples: number[] = [];
        const frameStride = PCM48_STEREO_CHANNELS;
        const samplesPerOutput = PCM48_TO_16_DECIMATION * frameStride;
        for (let i = 0; i + samplesPerOutput <= l.length; i += samplesPerOutput) {
          let monoAccumulator = 0;
          for (let frame = 0; frame < PCM48_TO_16_DECIMATION; frame += 1) {
            const base = i + frame * frameStride;
            const left = l[base] ?? 0;
            const right = r[base] ?? left;
            monoAccumulator += averageStereoFrame(left, right);
          }
          samples.push(monoAccumulator / PCM48_TO_16_DECIMATION);
        }
        // pack to PCM16
        const out = new Int16Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
          out[i] = floatToPcm16(samples[i] ?? 0);
        }
        controller.enqueue(new Uint8Array(out.buffer));
      };
    },
    cancel() {
      processor.disconnect();
      srcNode.disconnect();
      audioCtx.close();
    },
  });

  return reader;
};

// Playback PCM16 mono 16k frames streamed over a RTCDataChannel labelled 'audio'
const createPcmPlayer = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 16000,
  });
  let scheduled = ctx.currentTime;
  const scheduleFrame = (bytes: ArrayBuffer) => {
    const pcm = new Int16Array(bytes);
    const buf = ctx.createBuffer(1, pcm.length, 16000);
    const ch = buf.getChannelData(0);
    if (ch) {
      for (let i = 0; i < pcm.length; i++) {
        const sample = pcm[i];
        if (sample !== undefined) {
          ch[i] = Math.max(-1, Math.min(1, sample / 32768));
        }
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const startAt = Math.max(ctx.currentTime, scheduled);
    src.start(startAt);
    scheduled = startAt + buf.duration;
  };
  return { scheduleFrame, close: () => ctx.close() };
};

// --- WebRTC signaling over WebSocket --------------------------------------
const connectSignaling = (url: string, token?: string) => {
  const ws = new WebSocket(token ? `${url}?token=${encodeURIComponent(token)}` : url);
  const listeners = new Map<string, (msg: any) => void>();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(String(ev.data));
    const fn = listeners.get(msg.type);
    if (typeof fn === 'function') fn(msg);
  };
  return {
    send: (type: string, data: any) =>
      ws.readyState === 1 && ws.send(JSON.stringify({ type, ...data })),
    on: (type: string, fn: (msg: any) => void) => {
      listeners.set(type, fn);
      return () => listeners.delete(type);
    },
    close: () => ws.close(),
  };
};

// --- Web Component ---------------------------------------------------------
export class DuckChat extends HTMLElement {
  #pc?: RTCPeerConnection;
  #sig?: ReturnType<typeof connectSignaling>;
  #voice?: RTCDataChannel;
  #player?: ReturnType<typeof createPcmPlayer>;
  #log?: HTMLElement;
  #tts = window.speechSynthesis;
  #micStream?: MediaStream;
  #micReader?: ReadableStreamDefaultReader<Uint8Array>;
  #micAbort?: AbortController;
  #micPump?: Promise<void>;

  connectedCallback() {
    this.innerHTML = `
      <section class="row">
        <button id="mic" aria-pressed="false">🎤 Start mic</button>
        <span class="pill" id="status">idle</span>
        <input id="sig" placeholder="ws://localhost:8787/ws" style="flex:1"/>
        <input id="token" placeholder="(optional) token" style="width:14rem"/>
      </section>
      <section>
        <div class="row">
          <textarea id="text" placeholder="Type to send a message to Duck..."></textarea>
        </div>
        <div class="row">
          <button id="send">Send</button>
          <label><input type="checkbox" id="speak" checked> Speak replies (fallback)</label>
        </div>
      </section>
      <section>
        <div class="log" id="log"></div>
      </section>`;

    this.#log = $('#log', this) as HTMLElement;
    $('#send', this)?.addEventListener('click', () => this.#sendText());
    $('#mic', this)?.addEventListener('click', () => this.#toggleMic());

    // bootstrap connection immediately
    const sigUrl = $('#sig', this) as HTMLInputElement;
    const token = $('#token', this) as HTMLInputElement;
    sigUrl.value ||=
      (location.protocol === 'https:' ? 'wss' : 'ws') +
      '://' +
      location.host.replace(/:\d+$/, ':8787') +
      '/ws';
    this.#connect(sigUrl.value, token.value || undefined).catch((e) =>
      this.#logLine('error: ' + e.message),
    );
  }

  disconnectedCallback() {
    this.#sig?.close();
    this.#pc?.close();
    this.#player?.close();
    this.#stopMicCapture().catch(() => {});
    this.#closeVoiceChannel();
  }

  async #connect(sigUrl: string, token?: string) {
    this.#sig = connectSignaling(sigUrl, token);
    this.#pc = new RTCPeerConnection({
      iceServers: getIceServers(),
    });
    this.#voice = this.#pc.createDataChannel('voice');
    this.#prepareVoiceChannel(this.#voice);

    // Handle server-created channels: 'events' (text) and 'audio' (pcm frames)
    this.#pc.ondatachannel = (ev) => {
      if (ev.channel.label === 'events') {
        ev.channel.onmessage = (mev) => {
          try {
            const msg = JSON.parse(String(mev.data));
            if (msg.type === 'content.post' && msg.message) {
              this.#logLine('duck: ' + msg.message.text);
              const speak = ($('#speak', this) as HTMLInputElement)?.checked;
              if (speak) this.#speak(msg.message.text);
            }
          } catch (_) {
            /* noop */
          }
        };
      } else if (ev.channel.label === 'audio') {
        this.#player ||= createPcmPlayer();
        ev.channel.binaryType = 'arraybuffer';
        ev.channel.onmessage = (mev) => {
          const bytes = mev.data as ArrayBuffer;
          this.#player!.scheduleFrame(bytes);
        };
      }
    };

    // signaling
    this.#sig.on('ready', async () => {
      const offer = await this.#pc!.createOffer();
      await this.#pc!.setLocalDescription(offer);
      this.#sig!.send('offer', { sdp: offer.sdp });
    });
    this.#sig.on('answer', async ({ sdp }) => {
      await this.#pc!.setRemoteDescription({ type: 'answer', sdp });
      this.#logLine('webrtc connected');
    });
    this.#sig.on('ice', async ({ candidate }) => {
      if (candidate) await this.#pc!.addIceCandidate(candidate);
    });
    this.#pc.onicecandidate = (ev) => {
      if (ev.candidate) this.#sig!.send('ice', { candidate: ev.candidate });
    };
  }

  async #toggleMic() {
    const micBtn = $('#mic', this)!;
    const on = micBtn.getAttribute('aria-pressed') === 'true';
    if (on) {
      micBtn.setAttribute('aria-pressed', 'false');
      await this.#stopMicCapture();
      this.#closeVoiceChannel();
      this.#logLine('mic stopped');
      return;
    }
    try {
      const voice = await this.#ensureVoiceChannel();
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 2, sampleRate: 48000 },
        video: false,
      });
      this.#micStream = media;
      const pcm = await downsampleTo16kMono(media);
      const reader = pcm.getReader();
      this.#micReader = reader;
      const abort = new AbortController();
      this.#micAbort = abort;

      const pump = async () => {
        try {
          while (!abort.signal.aborted) {
            const { value, done } = await reader.read();
            if (done || abort.signal.aborted) break;
            if (voice.readyState !== 'open') break;
            voice.send(value.buffer);
          }
        } catch (error) {
          if (!abort.signal.aborted) console.warn('mic pump failed', error);
        }
      };
      this.#micPump = pump();
      this.#micPump.catch(() => {});
      micBtn.setAttribute('aria-pressed', 'true');
      this.#logLine('mic started');
    } catch (error) {
      console.error('failed to start mic', error);
      await this.#stopMicCapture();
      this.#closeVoiceChannel();
      micBtn.setAttribute('aria-pressed', 'false');
      this.#logLine('mic error: ' + (error instanceof Error ? error.message : 'unknown'));
    }
  }

  #prepareVoiceChannel(channel: RTCDataChannel) {
    channel.binaryType = 'arraybuffer';
    const clear = () => {
      if (this.#voice === channel) this.#voice = undefined;
      this.#stopMicCapture().catch(() => {});
      channel.removeEventListener('close', clear);
      channel.removeEventListener('error', clear);
    };
    channel.addEventListener('close', clear);
    channel.addEventListener('error', clear);
  }

  async #ensureVoiceChannel(): Promise<RTCDataChannel> {
    if (!this.#pc) throw new Error('not connected');
    let channel = this.#voice;
    if (!channel || channel.readyState === 'closing' || channel.readyState === 'closed') {
      channel = this.#pc.createDataChannel('voice');
      this.#prepareVoiceChannel(channel);
      this.#voice = channel;
    }
    if (channel.readyState === 'open') return channel;
    if (channel.readyState === 'connecting') {
      await new Promise<void>((resolve, reject) => {
        const handleOpen = () => {
          cleanup();
          resolve();
        };
        const handleFail = () => {
          cleanup();
          reject(new Error('voice channel closed'));
        };
        const cleanup = () => {
          channel?.removeEventListener('open', handleOpen);
          channel?.removeEventListener('close', handleFail);
          channel?.removeEventListener('error', handleFail);
        };
        channel?.addEventListener('open', handleOpen, { once: true });
        channel?.addEventListener('close', handleFail, { once: true });
        channel?.addEventListener('error', handleFail, { once: true });
      });
      return channel; // Return after waiting for connection
    }
    throw new Error('voice channel unavailable');
  }

  async #stopMicCapture() {
    this.#micAbort?.abort();
    this.#micAbort = undefined;
    const pump = this.#micPump;
    this.#micPump = undefined;
    try {
      await pump;
    } catch {}
    try {
      await this.#micReader?.cancel();
    } catch {}
    this.#micReader = undefined;
    this.#micStream?.getTracks().forEach((track) => track.stop());
    this.#micStream = undefined;
  }

  #closeVoiceChannel() {
    if (this.#voice) {
      try {
        this.#voice.close();
      } catch {}
      if (this.#voice?.readyState !== 'open') this.#voice = undefined;
    }
  }

  #speak(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      this.#tts.cancel();
      this.#tts.speak(u);
    } catch (_) {
      /* ignore */
    }
  }

  #sendText() {
    const el = $('#text', this) as HTMLTextAreaElement;
    const text = el.value.trim();
    if (!text) return;
    this.#sig?.send('text', { text });
    this.#logLine('you: ' + text);
    el.value = '';
  }

  #logLine(line: string) {
    const el = this.#log!;
    const p = document.createElement('div');
    p.textContent = `[${nowIso()}] ${line}`;
    el.appendChild(p);
    el.scrollTop = el.scrollHeight;
  }
}

function getIceServers(): RTCIceServer[] {
  try {
    const raw = localStorage.getItem('duck.iceServers');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

customElements.define('duck-chat', DuckChat);
