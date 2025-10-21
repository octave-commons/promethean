import type { Board, Task } from '../lib/types.js';

import { escapeHtml, renderBoardHtml } from './render.js';
import { KANBAN_STYLES } from './styles.js';

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

// export type KanbanBoardResponse = DeepReadonly<{
  board: Board;
  generatedAt: string;
  summary: {
    totalTasks: number;
    columns: ReadonlyArray<SummaryColumn>;
  };
}>;

type UiStatus = 'idle' | 'loading' | 'error';

type UiStatusState = DeepReadonly<{
  message: string;
  mode: UiStatus;
  updatedAt: string | null;
}>;

type MaybeReadonlyTask = DeepReadonly<Task> | Task;

type TaskSummary = DeepReadonly<{
  uuid: string;
  title: string;
  status: string;
}>;

type SearchResultsState =
  | DeepReadonly<{
      mode: 'search';
      term: string;
      executedAt: string;
      results: ReadonlyArray<TaskSummary>;
    }>
  | DeepReadonly<{
      mode: 'find-by-title';
      term: string;
      executedAt: string;
      result: TaskSummary | null;
    }>;

type ColumnInsight = DeepReadonly<{
  command: 'count' | 'getColumn' | 'getByColumn';
  column: string;
  executedAt: string;
  payload: unknown;
}>;

type CommandOutput = DeepReadonly<{
  command: string;
  executedAt: string;
  result: unknown;
}>;

type CommandLogStatus = 'ok' | 'error';

type ActionLogEntry = DeepReadonly<{
  id: string;
  command: string;
  status: CommandLogStatus;
  timestamp: string;
  message: string;
}>;

type DashboardState = DeepReadonly<{
  status: UiStatusState;
  payload: KanbanBoardResponse | null;
  selectedTaskId: string | null;
  selectedTask: Task | null;
  searchState: SearchResultsState | null;
  columnInsight: ColumnInsight | null;
  lastAction: CommandOutput | null;
  actionLog: ReadonlyArray<ActionLogEntry>;
}>;

type RenderParams = DeepReadonly<{
  status: UiStatusState;
  payload: KanbanBoardResponse | null;
  boardPath: string;
  tasksPath: string;
  selectedTask: Task | null;
  selectedTaskId: string | null;
  searchState: SearchResultsState | null;
  columnInsight: ColumnInsight | null;
  lastAction: CommandOutput | null;
  actionLog: ReadonlyArray<ActionLogEntry>;
}>;

type ShadowRenderRoot = Readonly<Pick<ShadowRoot, 'replaceChildren'>>;

type FetchResponse = Readonly<Pick<Response, 'ok' | 'status' | 'json'>>;

type ActionSuccessResponse = DeepReadonly<{
  ok: true;
  command: string;
  args: ReadonlyArray<string>;
  result: unknown;
  executedAt: string;
}>;

type ActionErrorResponse = DeepReadonly<{
  ok: false;
  error: string;
}>;

type ActionResponse = ActionSuccessResponse | ActionErrorResponse;

type ExecuteOptions = Readonly<{
  refreshAfter?: boolean;
  updateStatus?: boolean;
  recordLog?: boolean;
  onSuccess?: (result: unknown, executedAt: string) => void;
  onError?: (error: Error) => void;
}>;

type RefreshOptions = Readonly<{ preserveSelection?: boolean }>;

const REFRESH_INTERVAL_MS = 60_000;

const truncate = (value: string, limit: number): string =>
  value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;

const formatTimestamp = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const cloneTask = (task: DeepReadonly<Task>): Task => ({
  uuid: task.uuid,
  title: task.title,
  status: task.status,
  priority: task.priority,
  labels: Array.isArray(task.labels) ? [...task.labels] : undefined,
  created_at: task.created_at,
  estimates: task.estimates
    ? {
        complexity: task.estimates.complexity,
        scale: task.estimates.scale,
        time_to_completion: task.estimates.time_to_completion,
      }
    : undefined,
  content: task.content,
  slug: task.slug,
  sourcePath: task.sourcePath,
});

const findTaskInBoard = (
  board: DeepReadonly<Board> | null | undefined,
  taskId: string | null,
): Task | null => {
  if (!board || !taskId) return null;
  for (const column of board.columns) {
    const match = column.tasks.find((task) => task.uuid === taskId);
    if (match) {
      return cloneTask(match as DeepReadonly<Task>);
    }
  }
  return null;
};

const toTaskSummary = (task: DeepReadonly<Task>): TaskSummary => ({
  uuid: task.uuid,
  title: task.title,
  status: task.status,
});

const renderTaskSummaryList = (items: ReadonlyArray<TaskSummary>, emptyMessage: string): string => {
  if (items.length === 0) {
    return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  }
  const entries = items
    .map(
      (item) =>
        `<li><button type="button" class="result-button" data-ui-action="select-result" data-task-id="${escapeHtml(
          item.uuid,
        )}"><span class="result-title">${escapeHtml(
          item.title,
        )}</span><span class="result-status">${escapeHtml(item.status)}</span></button></li>`,
    )
    .join('');
  return `<ol class="search-results-list">${entries}</ol>`;
};

const renderSearchResults = (state: SearchResultsState | null): string => {
  if (!state) {
    return '<p class="muted">Run a search to see matching tasks.</p>';
  }
  if (state.mode === 'search') {
    return `
      <div class="search-results">
        <header class="panel-subheader">
          <h3>Results for “${escapeHtml(state.term)}”</h3>
          <span>${escapeHtml(formatTimestamp(state.executedAt))}</span>
        </header>
        ${renderTaskSummaryList(state.results, 'No tasks matched your search.')}
      </div>
    `;
  }
  const summary = state.result
    ? `<div class="search-single">
         <button type="button" class="result-button" data-ui-action="select-result" data-task-id="${escapeHtml(
           state.result.uuid,
         )}">
           <span class="result-title">${escapeHtml(state.result.title)}</span>
           <span class="result-status">${escapeHtml(state.result.status)}</span>
         </button>
       </div>`
    : '<p class="muted">No task title matched the query.</p>';
  return `
    <div class="search-results">
      <header class="panel-subheader">
        <h3>Find by title: “${escapeHtml(state.term)}”</h3>
        <span>${escapeHtml(formatTimestamp(state.executedAt))}</span>
      </header>
      ${summary}
    </div>
  `;
};

const renderSelectedTask = (task: MaybeReadonlyTask | null): string => {
  if (!task) {
    return '<p class="muted">Select a task to inspect its details.</p>';
  }
  const labels =
    Array.isArray(task.labels) && task.labels.length > 0
      ? `<div class="selected-task-labels">${task.labels
          .map((label) => `<span>${escapeHtml(label)}</span>`)
          .join('')}</div>`
      : '';
  const metaRows = [
    task.status
      ? `<div><span class="meta-key">Status</span><span>${escapeHtml(task.status)}</span></div>`
      : '',
    task.priority !== undefined && task.priority !== null
      ? `<div><span class="meta-key">Priority</span><span>${escapeHtml(
          String(task.priority),
        )}</span></div>`
      : '',
    task.created_at
      ? `<div><span class="meta-key">Created</span><time datetime="${escapeHtml(
          task.created_at,
        )}">${escapeHtml(formatTimestamp(task.created_at))}</time></div>`
      : '',
    task.slug
      ? `<div><span class="meta-key">Slug</span><code>${escapeHtml(task.slug)}</code></div>`
      : '',
    task.sourcePath
      ? `<div><span class="meta-key">Source</span><code>${escapeHtml(task.sourcePath)}</code></div>`
      : '',
  ]
    .filter((row) => row.length > 0)
    .join('');
  const estimates = task.estimates
    ? Object.entries(task.estimates)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(
          ([key, value]) =>
            `<div><span class="meta-key">${escapeHtml(
              key.replace(/_/g, ' '),
            )}</span><span>${escapeHtml(String(value))}</span></div>`,
        )
        .join('')
    : '';
  const metaSection =
    metaRows.length > 0 || estimates.length > 0
      ? `<div class="selected-task-meta">${metaRows}${estimates}</div>`
      : '';
  const content =
    typeof task.content === 'string' && task.content.trim().length > 0
      ? `<p class="selected-task-body">${escapeHtml(truncate(task.content.trim(), 360))}</p>`
      : '';
  return `
    <article class="selected-task">
      <header>
        <h3>${escapeHtml(task.title)}</h3>
        <code>${escapeHtml(task.uuid)}</code>
      </header>
      ${labels}
      ${metaSection}
      ${content}
    </article>
  `;
};

const renderColumnInsight = (insight: ColumnInsight | null): string => {
  if (!insight) {
    return '<p class="muted">Inspect a column to see details here.</p>';
  }
  const payloadJson = escapeHtml(JSON.stringify(insight.payload, null, 2));
  return `
    <div class="column-insight">
      <header class="panel-subheader">
        <h3>${escapeHtml(insight.command)} → ${escapeHtml(insight.column)}</h3>
        <span>${escapeHtml(formatTimestamp(insight.executedAt))}</span>
      </header>
      <pre>${payloadJson}</pre>
    </div>
  `;
};

const renderLastAction = (output: CommandOutput | null): string => {
  if (!output) {
    return '<p class="muted">Run a command to view its response.</p>';
  }
  return `
    <div class="command-output">
      <header class="panel-subheader">
        <h3>${escapeHtml(output.command)}</h3>
        <span>${escapeHtml(formatTimestamp(output.executedAt))}</span>
      </header>
      <pre>${escapeHtml(JSON.stringify(output.result, null, 2))}</pre>
    </div>
  `;
};

const renderActionLog = (entries: ReadonlyArray<ActionLogEntry>): string => {
  if (entries.length === 0) {
    return '<p class="muted">Command activity will appear here.</p>';
  }
  const items = entries
    .map(
      (entry) =>
        `<li data-status="${escapeHtml(entry.status)}"><span>${escapeHtml(
          entry.command,
        )}</span><time datetime="${escapeHtml(entry.timestamp)}">${escapeHtml(
          formatTimestamp(entry.timestamp),
        )}</time><span class="log-message">${escapeHtml(entry.message)}</span></li>`,
    )
    .join('');
  return `<ol class="action-log">${items}</ol>`;
};

const renderColumnOptions = (payload: KanbanBoardResponse | null): string => {
  if (!payload) return '';
  return payload.board.columns
    .map(
      (column) => `<option value="${escapeHtml(column.name)}">${escapeHtml(column.name)}</option>`,
    )
    .join('');
};

const renderMarkup = (params: RenderParams): string => {
  const updatedAt = params.status.updatedAt ? formatTimestamp(params.status.updatedAt) : '—';
  const boardMarkup = params.payload
    ? renderBoardHtml(params.payload.board, {
        selectedTaskId: params.selectedTaskId ?? undefined,
        interactive: true,
        columns: params.payload.board.columns.map((column) => column.name),
      })
    : '<p class="task-empty">Board data unavailable.</p>';
  const boardPathLine =
    params.boardPath.length > 0
      ? `<p class="muted">Board: <code>${escapeHtml(params.boardPath)}</code></p>`
      : '';
  const tasksPathLine =
    params.tasksPath.length > 0
      ? `<p class="muted">Tasks: <code>${escapeHtml(params.tasksPath)}</code></p>`
      : '';
  const columnOptions = renderColumnOptions(params.payload);
  const columnDisabled = columnOptions.length === 0 ? ' disabled' : '';
  return `
    <style>${KANBAN_STYLES}</style>
    <div class="kanban-app">
      <header class="kanban-header">
        <div>
          <h1>Promethean Kanban</h1>
          ${boardPathLine}
          ${tasksPathLine}
        </div>
        <div class="kanban-controls">
          <button type="button" data-action="refresh">Refresh</button>
          <span class="status" data-state="${escapeHtml(params.status.mode)}">${escapeHtml(
            params.status.message,
          )}</span>
          <time datetime="${escapeHtml(params.status.updatedAt ?? '')}">${escapeHtml(
            updatedAt,
          )}</time>
        </div>
      </header>
      <div class="kanban-main">
        <div class="board-container">${boardMarkup}</div>
        <aside class="kanban-sidebar">
          <section class="panel">
            <h2>Selected task</h2>
            ${renderSelectedTask(params.selectedTask)}
          </section>
          <section class="panel">
            <h2>Search tasks</h2>
            <form class="search-form" data-form="search">
              <label for="search-term" class="visually-hidden">Search term</label>
              <input id="search-term" name="term" type="text" placeholder="Search for tasks" />
              <div class="search-buttons">
                <button type="submit" class="command-button" data-command="search">Search</button>
                <button type="submit" class="command-button" data-command="find-by-title">Find by title</button>
              </div>
            </form>
            ${renderSearchResults(params.searchState)}
          </section>
          <section class="panel">
            <h2>Column inspector</h2>
            <form class="column-form" data-form="column-tools">
              <label for="column-name" class="visually-hidden">Column</label>
              <select id="column-name" name="column"${columnDisabled}>
                ${columnOptions}
              </select>
              <div class="column-buttons">
                <button type="submit" class="command-button" data-command="count"${columnDisabled}>Count</button>
                <button type="submit" class="command-button" data-command="getColumn"${columnDisabled}>Get column</button>
                <button type="submit" class="command-button" data-command="getByColumn"${columnDisabled}>List tasks</button>
              </div>
            </form>
            ${renderColumnInsight(params.columnInsight)}
          </section>
          <section class="panel">
            <h2>Board maintenance</h2>
            <div class="button-grid">
              <button type="button" class="command-button" data-command="pull">Pull</button>
              <button type="button" class="command-button" data-command="push">Push</button>
              <button type="button" class="command-button" data-command="sync">Sync</button>
              <button type="button" class="command-button" data-command="regenerate">Regenerate</button>
              <button type="button" class="command-button" data-command="indexForSearch">Index for search</button>
            </div>
          </section>
          <section class="panel">
            <h2>Last response</h2>
            ${renderLastAction(params.lastAction)}
          </section>
          <section class="panel">
            <h2>Activity</h2>
            ${renderActionLog(params.actionLog)}
          </section>
        </aside>
      </div>
    </div>
  `;
};

const renderToShadow = (shadow: ShadowRenderRoot, params: RenderParams): void => {
  const fragment = document.createRange().createContextualFragment(renderMarkup(params));
  shadow.replaceChildren(fragment);
};

const parseResponse = async (response: FetchResponse): Promise<KanbanBoardResponse> => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as KanbanBoardResponse;
};

const fetchBoardData = (): Promise<KanbanBoardResponse> =>
  fetch('/api/board', {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  }).then(parseResponse);

const parseActionResponse = async (response: FetchResponse): Promise<ActionSuccessResponse> => {
  const payload = (await response.json()) as ActionResponse;
  if (!response.ok || !payload.ok) {
    const message = payload.ok ? `Request failed with status ${response.status}` : payload.error;
    throw new Error(message);
  }
  return payload;
};

const invokeAction = (payload: Readonly<{ command: string; args?: ReadonlyArray<string> }>) =>
  fetch('/api/actions', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(parseActionResponse);

class PrometheanKanbanDashboard extends HTMLElement {
  private state: DashboardState;

  private refreshTimer: number | null = null;

  private get boardPath(): string {
    return this.dataset.boardPath ?? '';
  }

  private get tasksPath(): string {
    return this.dataset.tasksPath ?? '';
  }

  private readonly handleClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.dataset.action === 'refresh') {
      event.preventDefault();
      void this.refresh({ preserveSelection: true });
      return;
    }

    const uiAction = target.dataset.uiAction;
    if (uiAction === 'select-result') {
      const taskId = target.dataset.taskId ?? '';
      if (taskId.length > 0) {
        event.preventDefault();
        void this.selectTask(taskId);
      }
      return;
    }

    const command = target.dataset.command;
    if (command) {
      const taskId = target.dataset.taskId;
      switch (command) {
        case 'move_up':
        case 'move_down': {
          event.preventDefault();
          if (taskId) {
            void this.executeRemoteCommand(command, [taskId], {
              refreshAfter: true,
            });
          }
          return;
        }
        case 'pull':
        case 'push':
        case 'sync':
        case 'regenerate': {
          event.preventDefault();
          void this.executeRemoteCommand(command, [], { refreshAfter: true });
          return;
        }
        case 'indexForSearch': {
          event.preventDefault();
          void this.executeRemoteCommand(command, [], { refreshAfter: false });
          return;
        }
        default:
          break;
      }
    }

    const taskCard = target.closest('[data-role=task-card]');
    if (taskCard instanceof HTMLElement) {
      const taskId = taskCard.dataset.taskId;
      if (taskId) {
        event.preventDefault();
        void this.selectTask(taskId);
      }
    }
  };

  private readonly handleChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    if (target.dataset.command === 'update_status') {
      const taskId = target.dataset.taskId;
      if (!taskId) {
        return;
      }
      const previousValue = target.dataset.currentStatus ?? '';
      const nextValue = target.value;
      void this.executeRemoteCommand('update_status', [taskId, nextValue], {
        refreshAfter: true,
        onError: () => {
          target.value = previousValue;
          target.dataset.currentStatus = previousValue;
        },
        onSuccess: () => {
          target.dataset.currentStatus = nextValue;
        },
      });
    }
  };

  private readonly handleSubmitEvent = (event: Event): void => {
    this.handleSubmit(event as SubmitEvent);
  };

  private readonly handleSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const submitter = event.submitter;
    if (!(submitter instanceof HTMLElement)) {
      return;
    }
    const command = submitter.dataset.command;
    if (!command) {
      return;
    }
    const formType = form.dataset.form;
    if (formType === 'search') {
      const formData = new FormData(form);
      const term = String(formData.get('term') ?? '').trim();
      if (term.length === 0) {
        this.setStatus('Enter a term to search', 'error');
        return;
      }
      void this.executeRemoteCommand(command, [term], {
        onSuccess: (result, executedAt) => {
          if (command === 'search' && Array.isArray(result)) {
            const summaries = (result as ReadonlyArray<DeepReadonly<Task>>).map(toTaskSummary);
            this.updateState((prev) => ({
              ...prev,
              searchState: {
                mode: 'search',
                term,
                executedAt,
                results: summaries,
              },
            }));
          } else if (command === 'find-by-title') {
            const maybeTask =
              result && typeof result === 'object'
                ? toTaskSummary(result as DeepReadonly<Task>)
                : null;
            this.updateState((prev) => ({
              ...prev,
              searchState: {
                mode: 'find-by-title',
                term,
                executedAt,
                result: maybeTask,
              },
            }));
          }
        },
      });
      form.reset();
      return;
    }

    if (formType === 'column-tools') {
      const formData = new FormData(form);
      const column = String(formData.get('column') ?? '').trim();
      if (column.length === 0) {
        this.setStatus('Select a column first', 'error');
        return;
      }
      const args = command === 'count' ? [column] : [column];
      void this.executeRemoteCommand(command, args, {
        onSuccess: (result, executedAt) => {
          this.updateState((prev) => ({
            ...prev,
            columnInsight: {
              command: command as ColumnInsight['command'],
              column,
              executedAt,
              payload: result,
            },
          }));
        },
      });
    }
  };

  constructor() {
    super();
    this.state = {
      status: { message: 'Ready', mode: 'idle', updatedAt: null },
      payload: null,
      selectedTaskId: null,
      selectedTask: null,
      searchState: null,
      columnInsight: null,
      lastAction: null,
      actionLog: [],
    } satisfies DashboardState;
    const shadow = this.attachShadow({ mode: 'open' });
    renderToShadow(shadow, {
      status: this.state.status,
      payload: this.state.payload,
      boardPath: this.boardPath,
      tasksPath: this.tasksPath,
      selectedTask: this.state.selectedTask,
      selectedTaskId: this.state.selectedTaskId,
      searchState: this.state.searchState,
      columnInsight: this.state.columnInsight,
      lastAction: this.state.lastAction,
      actionLog: this.state.actionLog,
    });
    shadow.addEventListener('click', this.handleClick);
    shadow.addEventListener('change', this.handleChange);
    shadow.addEventListener('submit', this.handleSubmitEvent);
  }

  connectedCallback(): void {
    void this.refresh();
    this.refreshTimer = window.setInterval(() => {
      void this.refresh({ preserveSelection: true });
    }, REFRESH_INTERVAL_MS);
  }

  disconnectedCallback(): void {
    if (typeof this.refreshTimer === 'number') {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private updateState(updater: (prev: DashboardState) => DashboardState): void {
    this.state = updater(this.state);
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) return;
    renderToShadow(this.shadowRoot, {
      status: this.state.status,
      payload: this.state.payload,
      boardPath: this.boardPath,
      tasksPath: this.tasksPath,
      selectedTask: this.state.selectedTask,
      selectedTaskId: this.state.selectedTaskId,
      searchState: this.state.searchState,
      columnInsight: this.state.columnInsight,
      lastAction: this.state.lastAction,
      actionLog: this.state.actionLog,
    });
  }

  private setStatus(message: string, mode: UiStatus): void {
    this.updateState((prev) => ({
      ...prev,
      status: { message, mode, updatedAt: prev.status.updatedAt },
    }));
  }

  private async refresh(options: RefreshOptions = {}): Promise<void> {
    const { preserveSelection = false } = options;
    const currentSelection = preserveSelection ? this.state.selectedTaskId : null;
    this.setStatus('Loading…', 'loading');
    try {
      const payload = await fetchBoardData();
      const selectedTask = preserveSelection
        ? findTaskInBoard(payload.board, currentSelection)
        : null;
      this.updateState((prev) => ({
        ...prev,
        status: { message: 'Updated', mode: 'idle', updatedAt: payload.generatedAt },
        payload,
        selectedTaskId: selectedTask ? selectedTask.uuid : null,
        selectedTask,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error ?? 'unknown error');
      console.error('[kanban-ui] failed to refresh board', error);
      this.updateState((prev) => ({
        ...prev,
        status: { message: `Error: ${message}`, mode: 'error', updatedAt: prev.status.updatedAt },
      }));
    }
  }

  private async selectTask(taskId: string): Promise<void> {
    this.updateState((prev) => ({ ...prev, selectedTaskId: taskId }));
    try {
      const response = await this.executeRemoteCommand('find', [taskId], {
        updateStatus: false,
        recordLog: false,
      });
      const maybeTask =
        response && typeof response === 'object' ? cloneTask(response as DeepReadonly<Task>) : null;
      this.updateState((prev) => ({
        ...prev,
        selectedTaskId: taskId,
        selectedTask: maybeTask ?? findTaskInBoard(prev.payload?.board, taskId),
      }));
    } catch {
      this.updateState((prev) => ({
        ...prev,
        selectedTaskId: taskId,
        selectedTask: findTaskInBoard(prev.payload?.board, taskId),
      }));
    }
  }

  private appendLog(
    entry: Readonly<{
      command: string;
      status: CommandLogStatus;
      message: string;
      timestamp: string;
    }>,
  ): void {
    this.updateState((prev) => ({
      ...prev,
      actionLog: [
        {
          id: `${entry.timestamp}:${entry.command}:${entry.status}`,
          command: entry.command,
          status: entry.status,
          timestamp: entry.timestamp,
          message: entry.message,
        } satisfies ActionLogEntry,
        ...prev.actionLog,
      ].slice(0, 20),
    }));
  }

  private async executeRemoteCommand(
    command: string,
    args: ReadonlyArray<string>,
    options: ExecuteOptions = {},
  ): Promise<unknown> {
    const {
      refreshAfter = false,
      updateStatus = true,
      recordLog = true,
      onSuccess,
      onError,
    } = options;
    if (updateStatus) {
      this.setStatus(`Running ${command}…`, 'loading');
    }
    try {
      const response = await invokeAction({ command, args });
      if (recordLog) {
        this.appendLog({
          command,
          status: 'ok',
          message: 'completed',
          timestamp: response.executedAt,
        });
      }
      this.updateState((prev) => ({
        ...prev,
        lastAction: {
          command,
          executedAt: response.executedAt,
          result: response.result,
        },
        status: updateStatus
          ? { message: `${command} completed`, mode: 'idle', updatedAt: prev.status.updatedAt }
          : prev.status,
      }));
      if (onSuccess) {
        onSuccess(response.result, response.executedAt);
      }
      if (refreshAfter) {
        await this.refresh({ preserveSelection: true });
      }
      return response.result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error ?? 'unknown error'));
      if (recordLog) {
        this.appendLog({
          command,
          status: 'error',
          message: err.message,
          timestamp: new Date().toISOString(),
        });
      }
      if (updateStatus) {
        this.setStatus(`Error: ${err.message}`, 'error');
      }
      if (onError) {
        onError(err);
      }
      throw err;
    }
  }
}

customElements.define('promethean-kanban-dashboard', PrometheanKanbanDashboard);

const bootstrap = (): void => {
  const host = document.getElementById('kanban-root');
  if (!host) {
    console.warn('[kanban-ui] Missing #kanban-root container');
    return;
  }
  const boardPath = host.dataset.boardPath ?? '';
  const tasksPath = host.dataset.tasksPath ?? '';
  const dashboard = document.createElement('promethean-kanban-dashboard');
  if (boardPath.length > 0) {
    dashboard.setAttribute('data-board-path', boardPath);
  }
  if (tasksPath.length > 0) {
    dashboard.setAttribute('data-tasks-path', tasksPath);
  }
  host.replaceChildren(dashboard);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
