export type PipelineStep = { id: string; name: string };
export type Pipeline = { name: string; steps: PipelineStep[] };

async function init(): Promise<void> {
  const res = await fetch("/api/pipelines");
  const data: { pipelines: Pipeline[] } = await res.json();
  const container = document.getElementById("pipelines");
  if (!container) return;
  data.pipelines.forEach((p) => {
    const section = document.createElement("section");
    const h = document.createElement("h2");
    h.textContent = p.name;
    section.appendChild(h);
    p.steps.forEach((s) => {
      const btn = document.createElement("button");
      btn.textContent = s.id;
      btn.onclick = () => {
        const logs = document.getElementById("logs");
        if (!logs) return;
        logs.textContent = "";
        const es = new EventSource(
          `/api/run-step?pipeline=${encodeURIComponent(
            p.name,
          )}&step=${encodeURIComponent(s.id)}`,
        );
        es.onmessage = (e: MessageEvent<string>) => {
          logs.textContent += `${e.data}\n`;
        };
        es.onerror = () => es.close();
      };
      section.appendChild(btn);
    });
    container.appendChild(section);
  });
}

void init();
