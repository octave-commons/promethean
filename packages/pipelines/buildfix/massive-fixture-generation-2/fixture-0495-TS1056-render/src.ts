// import type { Board, ColumnData, Task } from '../lib/types.js';
// import {
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
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type ReadonlyEstimates = DeepReadonly<Task['estimates']> | undefined;

type ReadonlyTask = DeepReadonly<Task>;

type ReadonlyColumn = DeepReadonly<ColumnData>;

type ReadonlyBoard = DeepReadonly<Board>;

type RenderOptions = Readonly<{
  interactive?: boolean;
  selectedTaskId?: string | null;
  columns?: ReadonlyArray<string>;
}>;

type ColumnRenderOptions = Readonly<{
  interactive: boolean;
  selectedTaskId: string | null;
  columnNames: ReadonlyArray<string>;
  virtualization?: ColumnVirtualizationPlan | null;
}>;

type VirtualTaskPosition = Readonly<{
  index: number;
  itemHeight: number;
}>;

export const escapeHtml = (value: string | undefined): string => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const sanitizeMultiline = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/\r?\n+/g, ' ').trim();
};

const formatPriority = (priority: ReadonlyTask['priority']): string | undefined => {
  if (priority === null || typeof priority === 'undefined') {
    return undefined;
  }
  if (typeof priority === 'number') {
    return `P${priority}`;
  }
  const trimmed = priority.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
};

const formatCreatedAt = (createdAt: ReadonlyTask['created_at']): string | undefined => {
  if (typeof createdAt !== 'string' || createdAt.trim().length === 0) {
    return undefined;
  }
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? sanitizeMultiline(createdAt) : date.toLocaleString();
};

const truncate = (value: string, length: number): string =>
  value.length <= length ? value : `${value.slice(0, length - 1)}…`;

const renderLabels = (labels: ReadonlyArray<string> | undefined): string => {
  if (!labels || labels.length === 0) {
    return '';
  }
  const chips = labels
    .filter((label) => typeof label === 'string' && label.trim().length > 0)
    .map((label) => `<span class="task-label">${escapeHtml(label)}</span>`)
    .join('');
  return chips.length > 0 ? `<div class="task-labels" aria-label="Labels">${chips}</div>` : '';
};

const renderEstimates = (estimates: ReadonlyEstimates): ReadonlyArray<string> => {
  if (!estimates) return [];
  const complexity = typeof estimates.complexity === 'number' ? [`C${estimates.complexity}`] : [];
  const scale = typeof estimates.scale === 'number' ? [`S${estimates.scale}`] : [];
  const time =
    typeof estimates.time_to_completion === 'string'
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
          estimates.join(' · '),
        )}</span></span>`
      : undefined,
  ].filter((segment): segment is string => typeof segment === 'string');
  return segments.length > 0 ? `<div class="task-meta">${segments.join('')}</div>` : '';
};

const renderTaskContent = (content: ReadonlyTask['content']): string => {
  if (typeof content !== 'string') {
    return '';
  }
  const trimmed = content.trim();
  return trimmed.length === 0
    ? ''
    : `<p class="task-body">${escapeHtml(truncate(trimmed, 160))}</p>`;
};

const renderStatusSelect = (
  columnNames: ReadonlyArray<string>,
  currentStatus: string | undefined,
  taskId: string,
): string => {
  if (columnNames.length === 0) {
    return '';
  }
  const normalized = typeof currentStatus === 'string' ? currentStatus : columnNames[0] ?? '';
  const options = columnNames
    .map((name) => {
      const value = escapeHtml(name);
      const selected = name === normalized ? ' selected' : '';
      return `<option value="${value}"${selected}>${escapeHtml(name)}</option>`;
    })
    .join('');
  return `
    <label class="status-control">
      <span class="visually-hidden">Move to status</span>
      <select
        data-command="update_status"
        data-task-id="${escapeHtml(taskId)}"
        data-current-status="${escapeHtml(normalized)}"
      >${options}</select>
    </label>
  `;
};

const renderTaskControls = (task: ReadonlyTask, options: ColumnRenderOptions): string => {
  if (!options.interactive) {
    return '';
  }
  const taskId = escapeHtml(task.uuid);
  return `
    <div class="task-actions">
      <button
        type="button"
        class="task-action"
        data-command="move_up"
        data-task-id="${taskId}"
        aria-label="Move up"
      >▲</button>
      <button
        type="button"
        class="task-action"
        data-command="move_down"
        data-task-id="${taskId}"
        aria-label="Move down"
      >▼</button>
      ${renderStatusSelect(options.columnNames, task.status, task.uuid)}
    </div>
  `;
};

const renderTask = (
  task: ReadonlyTask,
  options: ColumnRenderOptions,
  virtualPosition?: VirtualTaskPosition | null,
): string => {
  const title =
    typeof task.title === 'string' && task.title.trim().length > 0 ? task.title.trim() : task.uuid;
  const priorityValue = formatPriority(task.priority);
  const priorityBadge = priorityValue
    ? `<span class="task-priority" data-priority="${escapeHtml(priorityValue)}">${escapeHtml(
        priorityValue,
      )}</span>`
    : '';
  const labelsBlock = renderLabels(task.labels);
  const contentBlock = renderTaskContent(task.content);
  const metaBlock = renderTaskMeta(task);
  const isSelected = options.selectedTaskId === task.uuid;
  const controls = renderTaskControls(task, options);
  const baseClasses = `task-card${isSelected ? ' is-selected' : ''}`;
  const attributes = [
    `class="${baseClasses}"`,
    'data-role="task-card"',
    `data-task-id="${escapeHtml(task.uuid)}"`,
  ];
  if (virtualPosition) {
    attributes.push(`data-virtual-index="${String(virtualPosition.index)}"`);
  }
  const styleAttribute = virtualPosition
    ? ` style="position: absolute; top: ${virtualPosition.index * virtualPosition.itemHeight}px; height: ${virtualPosition.itemHeight}px; width: 100%;"`
    : '';
  return `<li ${attributes.join(' ')}${styleAttribute}><header class="task-header"><h3>${escapeHtml(
    title,
  )}</h3>${priorityBadge}</header>${labelsBlock}${metaBlock}${contentBlock}${controls}</li>`;
};

const renderTasks = (column: ReadonlyColumn, options: ColumnRenderOptions): string =>
  column.tasks.length === 0
    ? '<li class="task-empty">No tasks yet.</li>'
    : column.tasks.map((task) => renderTask(task, options)).join('');

const renderColumnHeader = (column: ReadonlyColumn): string => {
  const limit =
    typeof column.limit === 'number' && Number.isFinite(column.limit)
      ? escapeHtml(String(column.limit))
      : '';
  const count = Number.isFinite(column.count) ? column.count : column.tasks.length;
  const limitLabel = limit.length > 0 ? ` / ${limit}` : '';
  return `<div class="column-header"><h2>${escapeHtml(
    column.name,
  )}</h2><span class="column-count">${escapeHtml(String(count))}${limitLabel}</span></div>`;
};

const renderVirtualizedColumnContent = (
  column: ReadonlyColumn,
  options: ColumnRenderOptions,
  virtualization: ColumnVirtualizationPlan,
): string => {
  if (!virtualization.enabled || virtualization.totalItems === 0) {
    return `<ol class="task-list" aria-label="${escapeHtml(column.name)} tasks">${renderTasks(
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
    const selectedIndex = column.tasks.findIndex((task) => task.uuid === selectedTaskId);
    if (selectedIndex >= 0 && selectedIndex < totalItems) {
      if (selectedIndex < startIndex || selectedIndex >= endIndex) {
        const offset = Math.floor(windowSize / 2);
        startIndex = Math.max(0, selectedIndex - offset);
        endIndex = Math.min(totalItems, startIndex + windowSize);
        if (endIndex - startIndex < windowSize) {
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
              index: startIndex + offset,
              itemHeight: virtualization.itemHeight,
            }),
          )
          .join('');
  const spacerHeight = totalItems * virtualization.itemHeight;
  const containerAttributes = [
    'class="task-list task-list-virtual virtual-scroll-items"',
    'data-role="virtual-scroll-items"',
    `data-column="${escapeHtml(column.name)}"`,
    `data-total-items="${String(totalItems)}"`,
    `data-item-height="${String(virtualization.itemHeight)}"`,
    `data-buffer-size="${String(virtualization.bufferSize)}"`,
    `data-start-index="${String(startIndex)}"`,
    `data-end-index="${String(endIndex)}"`,
    'style="position: absolute; top: 0; left: 0; right: 0;"',
  ];
  return `
    <div class="virtual-scroll-wrapper" data-role="virtual-scroll-wrapper">
      <div class="virtual-scroll-container" data-role="virtual-scroll-container">
        <div class="virtual-scroll-viewport" data-role="virtual-scroll-viewport" style="position: relative; height: ${virtualization.viewportHeight}px; overflow-y: auto;">
          <div class="virtual-scroll-spacer" data-role="virtual-scroll-spacer" style="height: ${spacerHeight}px;"></div>
          <ol ${containerAttributes.join(' ')}>${tasksMarkup}</ol>
        </div>
      </div>
    </div>
  `;
};

const renderColumn = (column: ReadonlyColumn, options: ColumnRenderOptions): string => {
  const virtualization = options.virtualization;
  const columnClasses =
    virtualization && virtualization.enabled ? 'kanban-column kanban-column-virtual' : 'kanban-column';
  const bodyMarkup =
    virtualization && virtualization.enabled
      ? renderVirtualizedColumnContent(column, options, virtualization)
      : `<ol class="task-list" aria-label="${escapeHtml(column.name)} tasks">${renderTasks(column, options)}</ol>`;
  return `<section class="${columnClasses}" data-column="${escapeHtml(
    column.name,
  )}">${renderColumnHeader(column)}${bodyMarkup}</section>`;
};

const summarizeBoard = (
  board: ReadonlyBoard,
): Readonly<{
  readonly totalTasks: number;
  readonly totalColumns: number;
}> => ({
  totalTasks: board.columns.reduce(
    (acc, column) => acc + (Number.isFinite(column.count) ? column.count : column.tasks.length),
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

export const renderBoardHtml = (board: ReadonlyBoard, options: RenderOptions = {}): string => {
  const readonlyBoard: ReadonlyBoard = {
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => ({ ...task }) as ReadonlyTask),
    })),
  };
  const selectedColumns =
    options.columns && options.columns.length > 0
      ? new Set(options.columns)
      : null;
  const viewColumns = selectedColumns
    ? readonlyBoard.columns.filter((column) => selectedColumns.has(column.name))
    : readonlyBoard.columns;
  const viewBoard: ReadonlyBoard = { columns: viewColumns };
  const virtualScrollPlan = planVirtualScroll(viewBoard.columns);
  const columnNames =
    options.columns && options.columns.length > 0
      ? options.columns
      : viewBoard.columns.map((column) => column.name);
  const baseColumnOptions = {
    interactive: options.interactive ?? false,
    selectedTaskId: options.selectedTaskId ?? null,
    columnNames,
  };
  const columnsMarkup = viewBoard.columns
    .map((column) =>
      renderColumn(column, {
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
  const boardAttributes = [`class="kanban-columns${boardClass}"`];
  if (hasVirtualizedColumn) {
    boardAttributes.push('data-use-virtual-scroll="true"');
  }
  return `${renderSummary(
    viewBoard,
  )}<section ${boardAttributes.join(' ')}>${columnsMarkup}</section>${scriptMarkup}`;
};
