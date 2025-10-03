import type { Board, ColumnData, Task } from "../lib/types.js";

type Primitive = string | number | boolean | symbol | null | undefined | bigint;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type ReadonlyEstimates = DeepReadonly<Task["estimates"]> | undefined;

type ReadonlyTask = DeepReadonly<Task>;

type ReadonlyColumn = DeepReadonly<ColumnData>;

type ReadonlyBoard = DeepReadonly<Board>;

export const escapeHtml = (value: string | undefined): string => {
  if (typeof value !== "string") return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const sanitizeMultiline = (value: string | undefined): string => {
  if (!value) return "";
  return value.replace(/\r?\n+/g, " ").trim();
};

const formatPriority = (
  priority: ReadonlyTask["priority"],
): string | undefined => {
  if (priority === null || typeof priority === "undefined") {
    return undefined;
  }
  if (typeof priority === "number") {
    return `P${priority}`;
  }
  const trimmed = priority.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
};

const formatCreatedAt = (
  createdAt: ReadonlyTask["created_at"],
): string | undefined => {
  if (typeof createdAt !== "string" || createdAt.trim().length === 0) {
    return undefined;
  }
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? sanitizeMultiline(createdAt)
    : date.toLocaleString();
};

const truncate = (value: string, length: number): string =>
  value.length <= length ? value : `${value.slice(0, length - 1)}…`;

const renderLabels = (labels: ReadonlyArray<string> | undefined): string => {
  if (!labels || labels.length === 0) {
    return "";
  }
  const chips = labels
    .filter((label) => typeof label === "string" && label.trim().length > 0)
    .map((label) => `<span class="task-label">${escapeHtml(label)}</span>`)
    .join("");
  return chips.length > 0
    ? `<div class="task-labels" aria-label="Labels">${chips}</div>`
    : "";
};

const renderEstimates = (
  estimates: ReadonlyEstimates,
): ReadonlyArray<string> => {
  if (!estimates) return [];
  const complexity =
    typeof estimates.complexity === "number"
      ? [`C${estimates.complexity}`]
      : [];
  const scale =
    typeof estimates.scale === "number" ? [`S${estimates.scale}`] : [];
  const time =
    typeof estimates.time_to_completion === "string"
      ? (() => {
          const trimmed = estimates.time_to_completion.trim();
          return trimmed.length > 0 ? [trimmed] : [];
        })()
      : [];
  return [...complexity, ...scale, ...time];
};

const renderTaskMeta = (task: ReadonlyTask): string => {
  const createdDisplay = formatCreatedAt(task.created_at);
  const estimates = renderEstimates(task.estimates);
  const segments = [
    createdDisplay
      ? `<span class="task-meta-item"><span class="meta-label">Created</span><time datetime="${escapeHtml(
          task.created_at,
        )}">${escapeHtml(createdDisplay)}</time></span>`
      : undefined,
    task.uuid
      ? `<span class="task-meta-item"><span class="meta-label">UUID</span><code>${escapeHtml(
          truncate(task.uuid, 12),
        )}</code></span>`
      : undefined,
    estimates.length > 0
      ? `<span class="task-meta-item"><span class="meta-label">Est.</span><span>${escapeHtml(
          estimates.join(" · "),
        )}</span></span>`
      : undefined,
  ].filter((segment): segment is string => typeof segment === "string");
  return segments.length > 0
    ? `<div class="task-meta">${segments.join("")}</div>`
    : "";
};

const renderTaskContent = (content: ReadonlyTask["content"]): string => {
  if (typeof content !== "string") {
    return "";
  }
  const trimmed = content.trim();
  return trimmed.length === 0
    ? ""
    : `<p class="task-body">${escapeHtml(truncate(trimmed, 160))}</p>`;
};

const renderTask = (task: ReadonlyTask): string => {
  const title =
    typeof task.title === "string" && task.title.trim().length > 0
      ? task.title.trim()
      : task.uuid;
  const priorityValue = formatPriority(task.priority);
  const priorityBadge = priorityValue
    ? `<span class="task-priority" data-priority="${escapeHtml(
        priorityValue,
      )}">${escapeHtml(priorityValue)}</span>`
    : "";
  const labelsBlock = renderLabels(task.labels);
  const contentBlock = renderTaskContent(task.content);
  const metaBlock = renderTaskMeta(task);
  return `<li class="task-card" data-uuid="${escapeHtml(
    task.uuid,
  )}"><header class="task-header"><h3>${escapeHtml(
    title,
  )}</h3>${priorityBadge}</header>${labelsBlock}${metaBlock}${contentBlock}</li>`;
};

const renderTasks = (column: ReadonlyColumn): string =>
  column.tasks.length === 0
    ? '<li class="task-empty">No tasks yet.</li>'
    : column.tasks.map(renderTask).join("");

const renderColumnHeader = (column: ReadonlyColumn): string => {
  const limit =
    typeof column.limit === "number" && Number.isFinite(column.limit)
      ? escapeHtml(String(column.limit))
      : "";
  const count = Number.isFinite(column.count)
    ? column.count
    : column.tasks.length;
  const limitLabel = limit.length > 0 ? ` / ${limit}` : "";
  return `<div class="column-header"><h2>${escapeHtml(
    column.name,
  )}</h2><span class="column-count">${escapeHtml(
    String(count),
  )}${limitLabel}</span></div>`;
};

const renderColumn = (column: ReadonlyColumn): string =>
  `<section class="kanban-column" data-column="${escapeHtml(
    column.name,
  )}">${renderColumnHeader(
    column,
  )}<ol class="task-list" aria-label="${escapeHtml(
    column.name,
  )} tasks">${renderTasks(column)}</ol></section>`;

const summarizeBoard = (
  board: ReadonlyBoard,
): Readonly<{
  readonly totalTasks: number;
  readonly totalColumns: number;
}> => ({
  totalTasks: board.columns.reduce(
    (acc, column) =>
      acc +
      (Number.isFinite(column.count) ? column.count : column.tasks.length),
    0,
  ),
  totalColumns: board.columns.length,
});

const renderSummary = (board: ReadonlyBoard): string => {
  const summary = summarizeBoard(board);
  return `<section class="board-summary"><div class="summary-card"><span class="summary-value">${escapeHtml(
    String(summary.totalTasks),
  )}</span><span class="summary-label">Total tasks</span></div><div class="summary-card"><span class="summary-value">${escapeHtml(
    String(summary.totalColumns),
  )}</span><span class="summary-label">Columns</span></div></section>`;
};

export const renderBoardHtml = (board: ReadonlyBoard): string => {
  const readonlyBoard: ReadonlyBoard = {
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => ({ ...task }) as ReadonlyTask),
    })),
  };
  const columnsMarkup = readonlyBoard.columns.map(renderColumn).join("");
  return `${renderSummary(
    readonlyBoard,
  )}<section class="kanban-columns">${columnsMarkup}</section>`;
};
