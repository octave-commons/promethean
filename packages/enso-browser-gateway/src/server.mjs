import http from 'node:http';
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';
import wrtc from 'wrtc';
import { EnsoClient, connectWebSocket } from '@promethean/enso-protocol';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const ENSO_URL = process.env.ENSO_WS_URL || 'ws://localhost:7766';

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('enso-browser-gateway');
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', async (ws) => {
  // ENSO client per browser
  const client = new EnsoClient();
  const hello = { caps: ['can.voice.stream', 'can.send.text'], agent: { name: 'duck-web', version: '0.0.1' } };
  const handle = connectWebSocket(client, ENSO_URL, hello);

  const pc = new wrtc.RTCPeerConnection();
  const events = pc.createDataChannel('events'); // outbound to browser
  let voice;

  // ICE back to browser
  pc.onicecandidate = (ev) => {
    if (ev.candidate) ws.send(JSON.stringify({ type: 'ice', candidate: ev.candidate }));
  };

  pc.ondatachannel = (ev) => {
    if (ev.channel.label === 'voice') {
      voice = ev.channel;
      let streamId = crypto.randomUUID();
      let seq = 0;
      const room = `voice:${Date.now()}`;
      client.voice.register(streamId, 0);

      voice.onmessage = async (mev) => {
        const buf = Buffer.from(mev.data);
        await client.voice.sendFrame({
          kind: 'voice.frame',
          codec: 'pcm16le/16000/1',
          streamId,
          seq: seq++,
          data: new Uint8Array(buf),
        }, { room });
      };
    }
  };

  // Mirror ENSO content.post text to browser
  client.on('event:content.post', (env) => {
    const message = env?.payload?.message;
    if (!message) return;
    const part = (message.parts || []).find((x) => x?.kind === 'text');
    const text = part?.text || '';
    events.send(JSON.stringify({ type: 'content.post', message: { text } }));
  });

  // Minimal signaling
  ws.send(JSON.stringify({ type: 'ready' }));
  ws.on('message', async (raw) => {
    const msg = JSON.parse(String(raw));
    if (msg.type === 'offer') {
      await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
    } else if (msg.type === 'ice') {
      await pc.addIceCandidate(msg.candidate);
    } else if (msg.type === 'text') {
      const room = `voice:${Date.now()}`;
      await client.post({ id: crypto.randomUUID(), role: 'human', parts: [{ kind: 'text', text: msg.text }], when: Date.now() }, { room });
    }
  });

  ws.on('close', async () => {
    try { await handle.close(); } catch {}
    try { pc.close(); } catch {}
  });
});

server.listen(PORT, () => console.log('enso-browser-gateway listening on :' + PORT));
