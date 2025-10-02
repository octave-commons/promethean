import http from "node:http";
import crypto from "node:crypto";
import url from "node:url";
import { WebSocketServer } from "ws";
import wrtc from "wrtc";
import { EnsoClient, connectWebSocket } from "@promethean/enso-protocol";
import { createHandshakeGuard } from "./handshake.mjs";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const ENSO_URL = process.env.ENSO_WS_URL || "ws://localhost:7766";
const ICE_SERVERS = parseIceServers(process.env.ICE_SERVERS); // JSON string of RTCIceServer[]
const AUTH_TOKEN = process.env.DUCK_TOKEN || null;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("enso-browser-gateway");
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", async (ws, req) => {
  // optional bearer token via query ?token=...
  if (AUTH_TOKEN) {
    const q = new url.URL(req.url, "http://localhost").searchParams;
    const tok = q.get("token");
    if (tok !== AUTH_TOKEN) {
      ws.close(4403, "forbidden");
      return;
    }
  }

  // ENSO client per browser
  const client = new EnsoClient();
  const hello = {
    proto: "ENSO-1",
    caps: ["can.voice.stream", "can.send.text"],
    agent: { name: "duck-web", version: "0.0.2" },
  };
  const handle = connectWebSocket(client, ENSO_URL, hello);
  const handshake = createHandshakeGuard(handle, ws, { logger: console });

  const ensureHandshake = async () => {
    try {
      await handshake.wait();
      return true;
    } catch {
      return false;
    }
  };

  const pc = new wrtc.RTCPeerConnection({ iceServers: ICE_SERVERS });
  const events = pc.createDataChannel("events"); // outbound to browser
  const audio = pc.createDataChannel("audio"); // optional: send pcm16 frames to browser
  let voice;
let readyCached = false;
const ensureHandshake = async () => {
  if (readyCached || handshake.isReady()) { readyCached = true; return true; }
  try { await handshake.wait(); readyCached = true; return true; }
  catch { return false; }
};
  // ICE back to browser
  pc.onicecandidate = (ev) => {
    if (ev.candidate)
      ws.send(JSON.stringify({ type: "ice", candidate: ev.candidate }));
  };

  pc.ondatachannel = (ev) => {
    if (ev.channel.label === "voice") {
      voice = ev.channel;
      let streamId = crypto.randomUUID();
      let seq = 0;
      const room = `voice:${Date.now()}`;
      const registerVoice = async () => {
        if (!(await ensureHandshake())) return;
        client.voice.register(streamId, 0);
      };
      void registerVoice();

      voice.onmessage = async (mev) => {
        const buf = Buffer.from(mev.data);
        if (!(await ensureHandshake())) return;
        await client.voice.sendFrame(
          {
            kind: "voice.frame",
            codec: "pcm16le/16000/1",
            streamId,
            seq: seq++,
            data: new Uint8Array(buf),
          },
          { room },
        );
      };
    }
  };

  // Mirror ENSO content.post text to browser
  client.on("event:content.post", async (env) => {
    if (!(await ensureHandshake())) return;
    const message = env?.payload?.message;
    if (!message) return;
    const part = (message.parts || []).find((x) => x?.kind === "text");
    const text = part?.text || "";
    events.send(JSON.stringify({ type: "content.post", message: { text } }));
  });

  // If/when ENSO emits audio frames for TTS, forward them to browser
  // Example (enable when available):
  // client.on('event:voice.frame', (env) => {
  //   const f = env.payload;
  //   if (f?.codec === 'pcm16le/16000/1') audio.send(Buffer.from(f.data));
  // });

  // Minimal signaling
  ws.send(JSON.stringify({ type: "ready" }));
  ws.on("message", async (raw) => {
    const msg = JSON.parse(String(raw));
    if (msg.type === "offer") {
      await pc.setRemoteDescription({ type: "offer", sdp: msg.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
    } else if (msg.type === "ice") {
      await pc.addIceCandidate(msg.candidate);
    } else if (msg.type === "text") {
      if (!(await ensureHandshake())) return;
      const room = `voice:${Date.now()}`;
      await client.post(
        {
          id: crypto.randomUUID(),
          role: "human",
          parts: [{ kind: "text", text: msg.text }],
          when: Date.now(),
        },
        { room },
      );
    }
  });

  ws.on("close", async () => {
    try {
      await handle.close();
    } catch {}
    try {
      pc.close();
    } catch {}
  });
});

server.listen(PORT, () =>
  console.log("enso-browser-gateway listening on :" + PORT),
);

function parseIceServers(json) {
  try {
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}
