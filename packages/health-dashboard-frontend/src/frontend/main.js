const statusEl = document.getElementById("conn-status");
const tableBody = document.getElementById("services");
const heartbeats = new Map();
const TIMEOUT = 10000;

function render() {
  const now = Date.now();
  const rows = [];
  for (const [name, hb] of heartbeats) {
    if (now - hb.last > TIMEOUT) {
      heartbeats.delete(name);
      continue;
    }
    const cpu = hb.cpu?.toFixed?.(1) ?? "0";
    const memMb = hb.memory
      ? (hb.memory / 1024 / 1024).toFixed(1) + " MB"
      : "0";
    rows.push(
      `<tr><td>${name}</td><td style="text-align:right;">${cpu}</td><td style="text-align:right;">${memMb}</td></tr>`,
    );
  }
  tableBody.innerHTML = rows.join("");
}

function connect() {
  const url =
    (location.protocol === "https:" ? "wss://" : "ws://") +
    location.hostname +
    ":7000";
  const ws = new WebSocket(url);
  statusEl.textContent = "connecting…";
  statusEl.classList.remove("ok", "bad");

  ws.addEventListener("open", () => {
    statusEl.textContent = "connected";
    statusEl.classList.add("ok");
    ws.send(JSON.stringify({ action: "subscribe", topic: "heartbeat" }));
  });

  ws.addEventListener("close", () => {
    statusEl.textContent = "disconnected";
    statusEl.classList.remove("ok");
    statusEl.classList.add("bad");
    setTimeout(connect, 2000);
  });

  ws.addEventListener("message", (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.event && msg.event.type === "heartbeat") {
        const { name, cpu = 0, memory = 0 } = msg.event.payload || {};
        const key = name || msg.event.source;
        heartbeats.set(key, { cpu, memory, last: Date.now() });
        render();
      }
    } catch {
      /* ignore */
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  connect();
  setInterval(render, 2000);
});
