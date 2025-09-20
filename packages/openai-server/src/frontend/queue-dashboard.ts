import type { DeepReadonly } from "../types/deepReadonly.js";

type QueueSummary = DeepReadonly<{
  pending: Array<{ id: string; enqueuedAt: number }>;
  processing: Array<{
    id: string;
    enqueuedAt: number;
    startedAt: number;
  }>;
  metrics: {
    enqueued: number;
    completed: number;
    failed: number;
  };
  recent: Array<{
    id: string;
    status: "completed" | "failed";
    enqueuedAt: number;
    startedAt: number;
    finishedAt: number;
    durationMs: number;
  }>;
  updatedAt: number;
}>;

const styles = `
  <style>
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      color: #1f2933;
      background: #f5f7fa;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
      max-width: 720px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.5rem;
      margin: 0;
    }

    time {
      font-size: 0.85rem;
      color: #52606d;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 0;
    }

    dt {
      font-size: 0.85rem;
      color: #52606d;
    }

    dd {
      font-size: 1.5rem;
      margin: 0;
      font-weight: 600;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0 0;
      display: grid;
      gap: 0.75rem;
    }

    li {
      background: white;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      border: 1px solid #d9e2ec;
    }

    .status {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .status[data-status="completed"] {
      color: #0d9488;
    }

    .status[data-status="failed"] {
      color: #dc2626;
    }

    .job-id {
      font-family: 'Fira Mono', 'SFMono-Regular', ui-monospace;
      font-size: 0.8rem;
      color: #334155;
    }

    .muted {
      color: #64748b;
      font-size: 0.8rem;
    }
  </style>
`;

const formatRelativeTime = (timestamp: number): string => {
  const delta = Date.now() - timestamp;
  if (!Number.isFinite(delta)) {
    return "";
  }
  if (delta < 1000) {
    return "just now";
  }
  if (delta < 60000) {
    return `${Math.round(delta / 1000)}s ago`;
  }
  if (delta < 3600000) {
    return `${Math.round(delta / 60000)}m ago`;
  }
  return new Date(timestamp).toLocaleString();
};

const createRecentMarkup = (recent: QueueSummary["recent"]): string =>
  recent
    .map((entry) => {
      const status = entry.status;
      const duration = `${entry.durationMs} ms`;
      const started = formatRelativeTime(entry.startedAt);
      return `
        <li>
          <div class="status" data-status="${status}">${status}</div>
          <div class="job-id">${entry.id}</div>
          <div class="muted">Started ${started} · Duration ${duration}</div>
        </li>
      `;
    })
    .join("");

const renderMarkup = (summary: QueueSummary): string => {
  const updatedAtIso = new Date(summary.updatedAt).toISOString();
  return `
    ${styles}
    <header>
      <div>
        <h1>Queue Dashboard</h1>
        <p class="muted">Monitor pending, processing and recently completed requests.</p>
      </div>
      <time datetime="${updatedAtIso}">${formatRelativeTime(
        summary.updatedAt,
      )}</time>
    </header>
    <dl>
      <div>
        <dt>Pending</dt>
        <dd>${summary.pending.length}</dd>
      </div>
      <div>
        <dt>Processing</dt>
        <dd>${summary.processing.length}</dd>
      </div>
      <div>
        <dt>Completed</dt>
        <dd>${summary.metrics.completed}</dd>
      </div>
      <div>
        <dt>Failed</dt>
        <dd>${summary.metrics.failed}</dd>
      </div>
    </dl>
    <section>
      <h2 class="muted">Recent jobs</h2>
      <ul>${createRecentMarkup(summary.recent)}</ul>
    </section>
  `;
};

type DashboardRoot = { readonly [K in "replaceChildren"]: ShadowRoot[K] };

type RenderParams = {
  readonly root: DashboardRoot;
  readonly summary: QueueSummary;
};

const renderDashboard = (params: RenderParams): void => {
  const fragment = document
    .createRange()
    .createContextualFragment(renderMarkup(params.summary));
  params.root.replaceChildren(fragment);
};

const fetchSnapshot = async (): Promise<QueueSummary> => {
  const response = await fetch("/queue/snapshot", {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Unable to fetch snapshot: ${response.status}`);
  }
  return (await response.json()) as QueueSummary;
};

const intervalRegistry = new WeakMap<OpenAIQueueDashboard, number>();

const createInitialSummary = (): QueueSummary => ({
  pending: [],
  processing: [],
  metrics: { enqueued: 0, completed: 0, failed: 0 },
  recent: [],
  updatedAt: Date.now(),
});

export class OpenAIQueueDashboard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    renderDashboard({ root: shadow, summary: createInitialSummary() });
  }

  connectedCallback(): void {
    void this.refresh();
    const intervalId = window.setInterval(() => {
      void this.refresh();
    }, 2500);
    intervalRegistry.set(this, intervalId);
  }

  disconnectedCallback(): void {
    const intervalId = intervalRegistry.get(this);
    if (typeof intervalId === "number") {
      window.clearInterval(intervalId);
      intervalRegistry.delete(this);
    }
  }

  private readonly refresh = (): Promise<void> =>
    fetchSnapshot()
      .then((summary) => {
        if (this.shadowRoot) {
          renderDashboard({ root: this.shadowRoot, summary });
        }
      })
      .catch((error) => {
        console.error(error);
      });
}

customElements.define("openai-queue-dashboard", OpenAIQueueDashboard);
