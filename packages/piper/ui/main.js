async function init() {
  const res = await fetch("/api/pipelines");
  const data = await res.json();
  const container = document.getElementById("pipelines");
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
        logs.textContent = "";
        const es = new EventSource(
          `/api/run-step?pipeline=${encodeURIComponent(
            p.name,
          )}&step=${encodeURIComponent(s.id)}`,
        );
        es.onmessage = (e) => {
          logs.textContent += e.data + "\n";
        };
        es.onerror = () => es.close();
      };
      section.appendChild(btn);
    });
    container.appendChild(section);
  });
}
init();
