import type { Board } from "../lib/types.js";

import { escapeHtml, renderBoardHtml } from "./render.js";
import { KANBAN_STYLES } from "./styles.js";

type Primitive = string | number | boolean | symbol | null | undefined | bigint;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type SummaryColumn = {
  readonly name: string;
  readonly count: number;
  readonly limit: number | null;
};

export type KanbanBoardResponse = DeepReadonly<{
  board: Board;
  generatedAt: string;
  summary: {
    totalTasks: number;
    columns: ReadonlyArray<SummaryColumn>;
  };
}>;

type UiStatus = "idle" | "loading" | "error";

type UiStatusState = DeepReadonly<{
  message: string;
  mode: UiStatus;
  updatedAt: string | null;
}>;

type RenderParams = DeepReadonly<{
  status: UiStatusState;
  payload: KanbanBoardResponse | null;
  boardPath: string;
  tasksPath: string;
}>;

type ShadowRenderRoot = Readonly<Pick<ShadowRoot, "replaceChildren">>;

type FetchResponse = Readonly<Pick<Response, "ok" | "status" | "json">>;

type RefreshEvent = DeepReadonly<Pick<Event, "target">>;

const REFRESH_INTERVAL_MS = 60_000;

const formatTimestamp = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const renderMarkup = (params: RenderParams): string => {
  const updatedAt = params.status.updatedAt;
  const updatedLabel = updatedAt ? formatTimestamp(updatedAt) : "—";
  const boardMarkup = params.payload
    ? renderBoardHtml(params.payload.board)
    : '<p class="task-empty">Board data unavailable.</p>';
  const boardLine =
    params.boardPath.length > 0
      ? `<p class="muted">Board: <code>${escapeHtml(
          params.boardPath,
        )}</code></p>`
      : "";
  const tasksLine =
    params.tasksPath.length > 0
      ? `<p class="muted">Tasks: <code>${escapeHtml(
          params.tasksPath,
        )}</code></p>`
      : "";
  return `
    <style>${KANBAN_STYLES}</style>
    <div class="kanban-app">
      <header class="kanban-header">
        <div>
          <h1>Promethean Kanban</h1>
          ${boardLine}
          ${tasksLine}
        </div>
        <div class="kanban-controls">
          <button type="button" data-action="refresh">Refresh</button>
          <span class="status" data-state="${escapeHtml(
            params.status.mode,
          )}">${escapeHtml(params.status.message)}</span>
          <time datetime="${escapeHtml(updatedAt ?? "")}">${escapeHtml(
            updatedLabel,
          )}</time>
        </div>
      </header>
      <div class="board-container">
        <div class="kanban-columns" aria-live="polite">${boardMarkup}</div>
      </div>
    </div>
  `;
};

const renderToShadow = (
  shadow: ShadowRenderRoot,
  params: RenderParams,
): void => {
  const fragment = document
    .createRange()
    .createContextualFragment(renderMarkup(params));
  shadow.replaceChildren(fragment);
};

const parseResponse = async (
  response: FetchResponse,
): Promise<KanbanBoardResponse> => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as KanbanBoardResponse;
};

const fetchBoardData = (): Promise<KanbanBoardResponse> =>
  fetch("/api/board", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(parseResponse);

const payloadCache = new WeakMap<
  PrometheanKanbanDashboard,
  KanbanBoardResponse | null
>();
const intervalRegistry = new WeakMap<PrometheanKanbanDashboard, number>();

class PrometheanKanbanDashboard extends HTMLElement {
  private get boardPath(): string {
    return this.dataset.boardPath ?? "";
  }

  private get tasksPath(): string {
    return this.dataset.tasksPath ?? "";
  }

  private readonly handleClick = (event: RefreshEvent): void => {
    const target = event.target;
    if (
      target instanceof HTMLButtonElement &&
      target.dataset.action === "refresh"
    ) {
      void this.refresh();
    }
  };

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    payloadCache.set(this, null);
    renderToShadow(shadow, {
      status: { message: "Ready", mode: "idle", updatedAt: null },
      payload: null,
      boardPath: this.boardPath,
      tasksPath: this.tasksPath,
    });
    shadow.addEventListener("click", this.handleClick);
  }

  connectedCallback(): void {
    void this.refresh();
    const intervalId = window.setInterval(() => {
      void this.refresh();
    }, REFRESH_INTERVAL_MS);
    intervalRegistry.set(this, intervalId);
  }

  disconnectedCallback(): void {
    const intervalId = intervalRegistry.get(this);
    if (typeof intervalId === "number") {
      window.clearInterval(intervalId);
      intervalRegistry.delete(this);
    }
  }

  private renderState(
    payload: KanbanBoardResponse | null,
    status: UiStatusState,
  ): void {
    if (!this.shadowRoot) return;
    renderToShadow(this.shadowRoot, {
      status,
      payload,
      boardPath: this.boardPath,
      tasksPath: this.tasksPath,
    });
  }

  private readonly refresh = (): Promise<void> => {
    const current = payloadCache.get(this) ?? null;
    this.renderState(current, {
      message: "Loading…",
      mode: "loading",
      updatedAt: current?.generatedAt ?? null,
    });
    return fetchBoardData()
      .then((payload) => {
        payloadCache.set(this, payload);
        this.renderState(payload, {
          message: "Updated",
          mode: "idle",
          updatedAt: payload.generatedAt,
        });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : String(error ?? "unknown error");
        console.error("[kanban-ui] failed to refresh board", error);
        this.renderState(current, {
          message: `Error: ${message}`,
          mode: "error",
          updatedAt: current?.generatedAt ?? null,
        });
      });
  };
}

customElements.define("promethean-kanban-dashboard", PrometheanKanbanDashboard);

const bootstrap = (): void => {
  const host = document.getElementById("kanban-root");
  if (!host) {
    console.warn("[kanban-ui] Missing #kanban-root container");
    return;
  }
  const boardPath = host.dataset.boardPath ?? "";
  const tasksPath = host.dataset.tasksPath ?? "";
  const dashboard = document.createElement("promethean-kanban-dashboard");
  if (boardPath.length > 0) {
    dashboard.setAttribute("data-board-path", boardPath);
  }
  if (tasksPath.length > 0) {
    dashboard.setAttribute("data-tasks-path", tasksPath);
  }
  host.replaceChildren(dashboard);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
