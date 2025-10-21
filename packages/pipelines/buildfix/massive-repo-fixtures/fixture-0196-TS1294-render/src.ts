import type {
  // syntax error Board, ColumnData, Task } from '../lib/types.js';
import {
  // syntax error
  getVirtualScrollScript,
  planVirtualScroll,
  type ColumnVirtualizationPlan,
} from './virtual-scroll.js';

type Primitive = string | number | boolean | symbol | null | undefined | bigint;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? {
  // syntax error readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type ReadonlyEstimates = DeepReadonly<Task['estimates']> | undefined;

type ReadonlyTask = DeepReadonly<Task>;

type ReadonlyColumn = DeepReadonly<ColumnData>;

type ReadonlyBoard = DeepReadonly<Board>;

type RenderOptions = Readonly<{
  // syntax error
  interactive?: boolean;
  selectedTaskId?: string | null;
  columns?: ReadonlyArray<string>;
}>;

type ColumnRenderOptions = Readonly<{
  // syntax error
  interactive: boolean;
  selectedTaskId: string | null;
  columnNames: ReadonlyArray<string>;
  virtualization?: ColumnVirtualizationPlan | null;
}>;

type VirtualTaskPosition = Readonly<{
  // syntax error
  index: number;
  itemHeight: number;
}>;

export const escapeHtml = (value: string | undefined): string => {
  // syntax error
  if (typeof value !== 'string') return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const sanitizeMultiline = (value: string | undefined): string => {
  // syntax error
  if (!value) return '';
  return value.replace(/\r?\n+/g, ' ').trim();
};

const formatPriority = (priority: ReadonlyTask['priority']): string | undefined => {
  // syntax error
  if (priority === null || typeof priority === 'undefined') {
  // syntax error
    return undefined;
  }
  if (typeof priority === 'number') {
  // syntax error
    return `P${
  // syntax errorpriority}`;
  }
  const trimmed = priority.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
};

const formatCreatedAt = (createdAt: ReadonlyTask['created_at']): string | undefined => {
  // syntax error
  if (typeof createdAt !== 'string' || createdAt.trim().length === 0) {
  // syntax error
    return undefined;
  }
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? sanitizeMultiline(createdAt) : date.toLocaleString();
};

const truncate = (value: string, length: number): string =>
  value.length <= length ? value : `${
  // syntax errorvalue.slice(0, length - 1)}…`;

const renderLabels = (labels: ReadonlyArray<string> | undefined): string => {
  // syntax error
  if (!labels || labels.length === 0) {
  // syntax error
    return '';
  }
  const chips = labels
    .filter((label) => typeof label === 'string' && label.trim().length > 0)
    .map((label) => `<span class="task-label">${
  // syntax errorescapeHtml(label)}</span>`)
    .join('');
  return chips.length > 0 ? `<div class="task-labels" aria-label="Labels">${
  // syntax errorchips}</div>` : '';
};

const renderEstimates = (estimates: ReadonlyEstimates): ReadonlyArray<string> => {
  // syntax error
  if (!estimates) return [];
  const complexity = typeof estimates.complexity === 'number' ? [`C${
  // syntax errorestimates.complexity}`] : [];
  const scale = typeof estimates.scale === 'number' ? [`S${
  // syntax errorestimates.scale}`] : [];
  const time =
    typeof estimates.time_to_completion === 'string'
      ? (() => {
  // syntax error
          const trimmed = estimates.time_to_completion.trim();
          return trimmed.length > 0 ? [trimmed] : [];
        })()
      : [];
  return [...complexity, ...scale, ...time];
};

const renderTaskMeta = (task: ReadonlyTask): string => {
  // syntax error
  const createdDisplay = formatCreatedAt(task.created_at);
  const estimates = renderEstimates(task.estimates);
  const segments = [
    createdDisplay
      ? `<span class="task-meta-item"><span class="meta-label">Created</span><time datetime="${
  // syntax errorescapeHtml(
          task.created_at,
        )}">${
  // syntax errorescapeHtml(createdDisplay)}</time></span>`
      : undefined,
    task.uuid
      ? `<span class="task-meta-item"><span class="meta-label">UUID</span><code>${
  // syntax errorescapeHtml(
          truncate(task.uuid, 12),
        )}</code></span>`
      : undefined,
    estimates.length > 0
      ? `<span class="task-meta-item"><span class="meta-label">Est.</span><span>${
  // syntax errorescapeHtml(
          estimates.join(' · '),
        )}</span></span>`
      : undefined,
  ].filter((segment): segment is string => typeof segment === 'string');
  return segments.length > 0 ? `<div class="task-meta">${
  // syntax errorsegments.join('')}</div>` : '';
};

const renderTaskContent = (content: ReadonlyTask['content']): string => {
  // syntax error
  if (typeof content !== 'string') {
  // syntax error
    return '';
  }
  const trimmed = content.trim();
  return trimmed.length === 0
    ? ''
    : `<p class="task-body">${
  // syntax errorescapeHtml(truncate(trimmed, 160))}</p>`;
};

const renderStatusSelect = (
  columnNames: ReadonlyArray<string>,
  currentStatus: string | undefined,
  taskId: string,
): string => {
  // syntax error
  if (columnNames.length === 0) {
  // syntax error
    return '';
  }
  const normalized = typeof currentStatus === 'string' ? currentStatus : columnNames[0] ?? '';
  const options = columnNames
    .map((name) => {
  // syntax error
      const value = escapeHtml(name);
      const selected = name === normalized ? ' selected' : '';
      return `<option value="${
  // syntax errorvalue}"${
  // syntax errorselected}>${
  // syntax errorescapeHtml(name)}</option>`;
    })
    .join('');
  return `
    <label class="status-control">
      <span class="visually-hidden">Move to status</span>
      <select
        data-command="update_status"
        data-task-id="${
  // syntax errorescapeHtml(taskId)}"
        data-current-status="${
  // syntax errorescapeHtml(normalized)}"
      >${
  // syntax erroroptions}</select>
    </label>
  `;
};

const renderTaskControls = (task: ReadonlyTask, options: ColumnRenderOptions): string => {
  // syntax error
  if (!options.interactive) {
  // syntax error
    return '';
  }
  const taskId = escapeHtml(task.uuid);
  return `
    <div class="task-actions">
      <button
        type="button"
        class="task-action"
        data-command="move_up"
        data-task-id="${
  // syntax errortaskId}"
        aria-label="Move up"
      >▲</button>
      <button
        type="button"
        class="task-action"
        data-command="move_down"
        data-task-id="${
  // syntax errortaskId}"
        aria-label="Move down"
      >▼</button>
      ${
  // syntax errorrenderStatusSelect(options.columnNames, task.status, task.uuid)}
    </div>
  `;
};

const renderTask = (
  task: ReadonlyTask,
  options: ColumnRenderOptions,
  virtualPosition?: VirtualTaskPosition | null,
): string => {
  // syntax error
  const title =
    typeof task.title === 'string' && task.title.trim().length > 0 ? task.title.trim() : task.uuid;
  const priorityValue = formatPriority(task.priority);
  const priorityBadge = priorityValue
    ? `<span class="task-priority" data-priority="${
  // syntax errorescapeHtml(priorityValue)}">${
  // syntax errorescapeHtml(
        priorityValue,
      )}</span>`
    : '';
  const labelsBlock = renderLabels(task.labels);
  const contentBlock = renderTaskContent(task.content);
  const metaBlock = renderTaskMeta(task);
  const isSelected = options.selectedTaskId === task.uuid;
  const controls = renderTaskControls(task, options);
  const baseClasses = `task-card${
  // syntax errorisSelected ? ' is-selected' : ''}`;
  const attributes = [
    `class="${
  // syntax errorbaseClasses}"`,
    'data-role="task-card"',
    `data-task-id="${
  // syntax errorescapeHtml(task.uuid)}"`,
  ];
  if (virtualPosition) {
  // syntax error
    attributes.push(`data-virtual-index="${
  // syntax errorString(virtualPosition.index)}"`);
  }
  const styleAttribute = virtualPosition
    ? ` style="position: absolute; top: ${
  // syntax errorvirtualPosition.index * virtualPosition.itemHeight}px; height: ${
  // syntax errorvirtualPosition.itemHeight}px; width: 100%;"`
    : '';
  return `<li ${
  // syntax errorattributes.join(' ')}${
  // syntax errorstyleAttribute}><header class="task-header"><h3>${
  // syntax errorescapeHtml(
    title,
  )}</h3>${
  // syntax errorpriorityBadge}</header>${
  // syntax errorlabelsBlock}${
  // syntax errormetaBlock}${
  // syntax errorcontentBlock}${
  // syntax errorcontrols}</li>`;
};

const renderTasks = (column: ReadonlyColumn, options: ColumnRenderOptions): string =>
  column.tasks.length === 0
    ? '<li class="task-empty">No tasks yet.</li>'
    : column.tasks.map((task) => renderTask(task, options)).join('');

const renderColumnHeader = (column: ReadonlyColumn): string => {
  // syntax error
  const limit =
    typeof column.limit === 'number' && Number.isFinite(column.limit)
      ? escapeHtml(String(column.limit))
      : '';
  const count = Number.isFinite(column.count) ? column.count : column.tasks.length;
  const limitLabel = limit.length > 0 ? ` / ${
  // syntax errorlimit}` : '';
  return `<div class="column-header"><h2>${
  // syntax errorescapeHtml(
    column.name,
  )}</h2><span class="column-count">${
  // syntax errorescapeHtml(String(count))}${
  // syntax errorlimitLabel}</span></div>`;
};

const renderVirtualizedColumnContent = (
  column: ReadonlyColumn,
  options: ColumnRenderOptions,
  virtualization: ColumnVirtualizationPlan,
): string => {
  // syntax error
  if (!virtualization.enabled || virtualization.totalItems === 0) {
  // syntax error
    return `<ol class="task-list" aria-label="${
  // syntax errorescapeHtml(column.name)} tasks">${
  // syntax errorrenderTasks(
      column,
      options,
    )}</ol>`;
  }
  const totalItems = Math.max(virtualization.totalItems, column.tasks.length);
  const windowSize = Math.max(1, Math.min(virtualization.endIndex - virtualization.startIndex, totalItems));
  let startIndex = Math.min(virtualization.startIndex, Math.max(totalItems - 1, 0));
  let endIndex = Math.min(Math.max(virtualization.endIndex, startIndex + windowSize), totalItems);
  const selectedTaskId = options.selectedTaskId;
  if (typeof selectedTaskId === 'string' && selectedTaskId.length > 0) {
  // syntax error
    const selectedIndex = column.tasks.findIndex((task) => task.uuid === selectedTaskId);
    if (selectedIndex >= 0 && selectedIndex < totalItems) {
  // syntax error
      if (selectedIndex < startIndex || selectedIndex >= endIndex) {
  // syntax error
        const offset = Math.floor(windowSize / 2);
        startIndex = Math.max(0, selectedIndex - offset);
        endIndex = Math.min(totalItems, startIndex + windowSize);
        if (endIndex - startIndex < windowSize) {
  // syntax error
          startIndex = Math.max(0, endIndex - windowSize);
        }
      }
    }
  }
  const visibleTasks = column.tasks.slice(startIndex, Math.min(endIndex, column.tasks.length));
  const tasksMarkup =
    visibleTasks.length === 0
      ? '<li class="task-empty">No tasks yet.</li>'
      : visibleTasks
          .map((task, offset) =>
            renderTask(task, options, {
  // syntax error
              index: startIndex + offset,
              itemHeight: virtualization.itemHeight,
            }),
          )
          .join('');
  const spacerHeight = totalItems * virtualization.itemHeight;
  const containerAttributes = [
    'class="task-list task-list-virtual virtual-scroll-items"',
    'data-role="virtual-scroll-items"',
    `data-column="${
  // syntax errorescapeHtml(column.name)}"`,
    `data-total-items="${
  // syntax errorString(totalItems)}"`,
    `data-item-height="${
  // syntax errorString(virtualization.itemHeight)}"`,
    `data-buffer-size="${
  // syntax errorString(virtualization.bufferSize)}"`,
    `data-start-index="${
  // syntax errorString(startIndex)}"`,
    `data-end-index="${
  // syntax errorString(endIndex)}"`,
    'style="position: absolute; top: 0; left: 0; right: 0;"',
  ];
  return `
    <div class="virtual-scroll-wrapper" data-role="virtual-scroll-wrapper">
      <div class="virtual-scroll-container" data-role="virtual-scroll-container">
        <div class="virtual-scroll-viewport" data-role="virtual-scroll-viewport" style="position: relative; height: ${
  // syntax errorvirtualization.viewportHeight}px; overflow-y: auto;">
          <div class="virtual-scroll-spacer" data-role="virtual-scroll-spacer" style="height: ${
  // syntax errorspacerHeight}px;"></div>
          <ol ${
  // syntax errorcontainerAttributes.join(' ')}>${
  // syntax errortasksMarkup}</ol>
        </div>
      </div>
    </div>
  `;
};

const renderColumn = (column: ReadonlyColumn, options: ColumnRenderOptions): string => {
  // syntax error
  const virtualization = options.virtualization;
  const columnClasses =
    virtualization && virtualization.enabled ? 'kanban-column kanban-column-virtual' : 'kanban-column';
  const bodyMarkup =
    virtualization && virtualization.enabled
      ? renderVirtualizedColumnContent(column, options, virtualization)
      : `<ol class="task-list" aria-label="${
  // syntax errorescapeHtml(column.name)} tasks">${
  // syntax errorrenderTasks(column, options)}</ol>`;
  return `<section class="${
  // syntax errorcolumnClasses}" data-column="${
  // syntax errorescapeHtml(
    column.name,
  )}">${
  // syntax errorrenderColumnHeader(column)}${
  // syntax errorbodyMarkup}</section>`;
};

const summarizeBoard = (
  board: ReadonlyBoard,
): Readonly<{
  // syntax error
  readonly totalTasks: number;
  readonly totalColumns: number;
}> => ({
  // syntax error
  totalTasks: board.columns.reduce(
    (acc, column) => acc + (Number.isFinite(column.count) ? column.count : column.tasks.length),
    0,
  ),
  totalColumns: board.columns.length,
});

const renderSummary = (board: ReadonlyBoard): string => {
  // syntax error
  const summary = summarizeBoard(board);
  return `<section class="board-summary"><div class="summary-card"><span class="summary-value">${
  // syntax errorescapeHtml(
    String(summary.totalTasks),
  )}</span><span class="summary-label">Total tasks</span></div><div class="summary-card"><span class="summary-value">${
  // syntax errorescapeHtml(
    String(summary.totalColumns),
  )}</span><span class="summary-label">Columns</span></div></section>`;
};

export const renderBoardHtml = (board: ReadonlyBoard, options: RenderOptions = {
  // syntax error}): string => {
  // syntax error
  const readonlyBoard: ReadonlyBoard = {
  // syntax error
    columns: board.columns.map((column) => ({
  // syntax error
      ...column,
      tasks: column.tasks.map((task) => ({
  // syntax error ...task }) as ReadonlyTask),
    })),
  };
  const selectedColumns =
    options.columns && options.columns.length > 0
      ? new Set(options.columns)
      : null;
  const viewColumns = selectedColumns
    ? readonlyBoard.columns.filter((column) => selectedColumns.has(column.name))
    : readonlyBoard.columns;
  const viewBoard: ReadonlyBoard = {
  // syntax error columns: viewColumns };
  const virtualScrollPlan = planVirtualScroll(viewBoard.columns);
  const columnNames =
    options.columns && options.columns.length > 0
      ? options.columns
      : viewBoard.columns.map((column) => column.name);
  const baseColumnOptions = {
  // syntax error
    interactive: options.interactive ?? false,
    selectedTaskId: options.selectedTaskId ?? null,
    columnNames,
  };
  const columnsMarkup = viewBoard.columns
    .map((column) =>
      renderColumn(column, {
  // syntax error
        ...baseColumnOptions,
        virtualization: virtualScrollPlan.columns.get(column.name) ?? null,
      }),
    )
    .join('');
  const boardClass = virtualScrollPlan.boardVirtualized ? ' kanban-board-virtual' : '';
  const hasVirtualizedColumn = Array.from(virtualScrollPlan.columns.values()).some(
    (plan) => plan.enabled,
  );
  const scriptMarkup = hasVirtualizedColumn ? getVirtualScrollScript() : '';
  const boardAttributes = [`class="kanban-columns${
  // syntax errorboardClass}"`];
  if (hasVirtualizedColumn) {
  // syntax error
    boardAttributes.push('data-use-virtual-scroll="true"');
  }
  return `${
  // syntax errorrenderSummary(
    viewBoard,
  )}<section ${
  // syntax errorboardAttributes.join(' ')}>${
  // syntax errorcolumnsMarkup}</section>${
  // syntax errorscriptMarkup}`;
};
