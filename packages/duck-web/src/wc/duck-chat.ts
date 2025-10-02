const identity = <T>(x: T) => x;

const $ = (sel: string, root: ParentNode = document) => root.querySelector(sel) as HTMLElement | null;
const nowIso = () => new Date().toISOString();

// --- Audio utilities -------------------------------------------------------
const downsampleTo16kMono = async (source: MediaStream): Promise<ReadableStream<Uint8Array>> => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
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
        for (let i = 0; i + 6 <= l.length; i += 6) {
          const m0 = (l[i] + r[i]) / 2;
          const m1 = (l[i + 2] + r[i + 2]) / 2;
          const m2 = (l[i + 4] + r[i + 4]) / 2;
          samples.push((m0 + m1 + m2) / 3);
        }
        // pack to PCM16 
        const out = new Int16Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
          let v = Math.max(-1, Math.min(1, samples[i]));
          out[i] = (v * 32767) | 0;
        }
        controller.enqueue(new Uint8Array(out.buffer));
      };
    },
    cancel() {
      processor.disconnect();
      srcNode.disconnect();
      audioCtx.close();
    }
  });

  return reader;
};

// Playback PCM16 mono 16k frames streamed over a RTCDataChannel labelled 'audio'
const createPcmPlayer = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  let scheduled = ctx.currentTime;
  const scheduleFrame = (bytes: ArrayBuffer) => {
    const pcm = new Int16Array(bytes);
    const buf = ctx.createBuffer(1, pcm.length, 16000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = Math.max(-1, Math.min(1, pcm[i] / 32768));
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
    if (fn) fn(msg);
  };
  return {
    send: (type: string, data: any) => ws.readyState === 1 && ws.send(JSON.stringify({ type, ...data })),
    on: (type: string, fn: (msg: any) => void) => { listeners.set(type, fn); return () => listeners.delete(type); },
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
    const sigUrl = ($('#sig', this) as HTMLInputElement);
    const token = ($('#token', this) as HTMLInputElement);
    sigUrl.value ||= (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host.replace(/:\d+$/, ':8787') + '/ws';
    this.#connect(sigUrl.value, token.value || undefined).catch((e) => this.#logLine('error: ' + e.message));
  }

  disconnectedCallback() {
    this.#sig?.close();
    this.#pc?.close();
    this.#player?.close();
  }

  async #connect(sigUrl: string, token?: string) {
    this.#sig = connectSignaling(sigUrl, token);
    this.#pc = new RTCPeerConnection({
      encodedInsertableStreams: false,
      iceServers: getIceServers(),
    });
    this.#voice = this.#pc.createDataChannel('voice');
    this.#voice.binaryType = 'arraybuffer';

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
          } catch (_) { /* noop */ }
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
      this.#logLine('mic stopped');
      return;
    }
    const media = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 2, sampleRate: 48000 }, video: false });
    const pcm = await downsampleTo16kMono(media);
    const writer = this.#voice!.send.bind(this.#voice);

    const reader = pcm.getReader();
    const pump = async () => {
      const { value, done } = await reader.read();
      if (done) return;
      writer(value.buffer);
      pump();
    };
    micBtn.setAttribute('aria-pressed', 'true');
    this.#logLine('mic started');
    pump();
  }

  #speak(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      this.#tts.cancel();
      this.#tts.speak(u);
    } catch (_) { /* ignore */ }
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
