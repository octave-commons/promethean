import type { ColumnData } from '../lib/types.js';

type Primitive = string | number | boolean | symbol | null | undefined | bigint;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type ReadonlyColumn = DeepReadonly<ColumnData>;

export let VIRTUAL_SCROLL_ITEM_HEIGHT = 80;
export let VIRTUAL_SCROLL_VIEWPORT_HEIGHT = 600;
export let VIRTUAL_SCROLL_BUFFER = 5;
export let BOARD_VIRTUAL_SCROLL_THRESHOLD = 100;
export let COLUMN_VIRTUAL_SCROLL_THRESHOLD = 50;

export type ColumnVirtualizationPlan = Readonly<{
  enabled: boolean;
  totalItems: number;
  itemHeight: number;
  bufferSize: number;
  viewportHeight: number;
  startIndex: number;
  endIndex: number;
}>;

export type BoardVirtualizationPlan = Readonly<{
  boardVirtualized: boolean;
  columns: ReadonlyMap<string, ColumnVirtualizationPlan>;
}>;

let clampRange = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export let computeVisibleRange = (
  totalItems: number,
  viewportHeight: number,
  itemHeight: number,
  bufferSize: number,
): Readonly<{ startIndex: number; endIndex: number }> => {
  if (!Number.isFinite(totalItems) || totalItems <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }
  let safeViewport = Math.max(viewportHeight, itemHeight);
  let baseVisible = Math.max(1, Math.ceil(safeViewport / Math.max(itemHeight, 1)));
  let buffered = clampRange(baseVisible + bufferSize * 2, baseVisible, totalItems);
  return {
    startIndex: 0,
    endIndex: buffered,
  };
};

let shouldVirtualizeBoard = (columns: ReadonlyArray<ReadonlyColumn>): boolean => {
  let totalItems = columns.reduce((acc, column) => acc + column.tasks.length, 0);
  if (totalItems > BOARD_VIRTUAL_SCROLL_THRESHOLD) {
    return true;
  }
  let heavyColumns = columns.filter((column) => column.tasks.length > COLUMN_VIRTUAL_SCROLL_THRESHOLD);
  return columns.length > 1 && totalItems >= BOARD_VIRTUAL_SCROLL_THRESHOLD && heavyColumns.length > 0;
};

export let planVirtualScroll = (columns: ReadonlyArray<ReadonlyColumn>): BoardVirtualizationPlan => {
  let boardVirtualized = shouldVirtualizeBoard(columns);
  let plans = new Map<string, ColumnVirtualizationPlan>();
  for (let column of columns) {
    let totalItems = column.tasks.length;
    let eligibleByColumn = totalItems >= BOARD_VIRTUAL_SCROLL_THRESHOLD;
    let enabled =
      totalItems > COLUMN_VIRTUAL_SCROLL_THRESHOLD && (boardVirtualized || eligibleByColumn);
    let { startIndex, endIndex } = computeVisibleRange(
      totalItems,
      VIRTUAL_SCROLL_VIEWPORT_HEIGHT,
      VIRTUAL_SCROLL_ITEM_HEIGHT,
      VIRTUAL_SCROLL_BUFFER,
    );
    let cappedEndIndex = Math.min(endIndex, totalItems);
    let normalizedStart = Math.min(startIndex, Math.max(totalItems - 1, 0));
    plans.set(column.name, {
      enabled,
      totalItems,
      itemHeight: VIRTUAL_SCROLL_ITEM_HEIGHT,
      bufferSize: VIRTUAL_SCROLL_BUFFER,
      viewportHeight: VIRTUAL_SCROLL_VIEWPORT_HEIGHT,
      startIndex: enabled ? normalizedStart : 0,
      endIndex: enabled ? cappedEndIndex : totalItems,
    });
  }
  return { boardVirtualized, columns: plans };
};

let VIRTUAL_SCROLL_SCRIPT = String.raw`<script type="module">
class VirtualScrollManager {
  letructor() {
    this.containers = Array.from(document.querySelectorAll('[data-role="virtual-scroll-container"]'));
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    if (!this.containers.length) return;
    this.containers.forEach((container) => {
      let viewport = container.querySelector('[data-role="virtual-scroll-viewport"]');
      if (!viewport) return;
      if (typeof container.addEventListener === 'function') {
        container.addEventListener('scroll', (event) => this.handleScroll(event));
      }
      viewport.addEventListener('scroll', (event) => this.handleScroll(event));
      window.addEventListener('resize', () => this.handleResize());
      this.updateVisibleItems(container);
    });
  }

  handleScroll(event) {
    let target = event && event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    let container = target.closest('[data-role="virtual-scroll-container"]');
    if (!container) return;
    this.updateVisibleItems(container);
  }

  handleResize() {
    this.containers.forEach((container) => {
      this.updateVisibleItems(container);
    });
  }

  calculateVirtualScrollRange(container) {
    let virtualContainer = container.querySelector('[data-role="virtual-scroll-items"]');
    let viewport = container.querySelector('[data-role="virtual-scroll-viewport"]');
    if (!virtualContainer || !viewport) {
      return { startIndex: 0, endIndex: 0 };
    }
    let totalItems = parseInt(virtualContainer.dataset.totalItems || '0', 10);
    let itemHeight = parseInt(virtualContainer.dataset.itemHeight || '0', 10);
    let bufferSize = parseInt(virtualContainer.dataset.bufferSize || '0', 10);
    if (!totalItems || !itemHeight) {
      return { startIndex: 0, endIndex: 0 };
    }
    let scrollTop = viewport.scrollTop;
    let viewportHeight = viewport.clientHeight;
    let startIndex = Math.max(Math.floor(scrollTop / itemHeight) - bufferSize, 0);
    let visibleCount = Math.ceil(viewportHeight / itemHeight) + bufferSize * 2;
    let endIndex = Math.min(totalItems, Math.max(startIndex + visibleCount, startIndex + 1));
    return { startIndex, endIndex };
  }

  updateVisibleItems(container) {
    let virtualContainer = container.querySelector('[data-role="virtual-scroll-items"]');
    let viewport = container.querySelector('[data-role="virtual-scroll-viewport"]');
    let spacer = container.querySelector('[data-role="virtual-scroll-spacer"]');
    if (!virtualContainer) return;
    if (!viewport || !spacer) return;
    let { startIndex, endIndex } = this.calculateVirtualScrollRange(container);
    virtualContainer.dataset.startIndex = String(startIndex);
    virtualContainer.dataset.endIndex = String(endIndex);
    let itemHeight = parseInt(virtualContainer.dataset.itemHeight || '0', 10);
    if (!itemHeight) return;
    let tasks = virtualContainer.querySelectorAll('[data-role="task-card"]');
    tasks.forEach((task, offset) => {
      if (!(task instanceof HTMLElement)) return;
      let index = startIndex + offset;
      task.style.position = 'absolute';
      task.style.top = (index * itemHeight) + 'px';
      task.style.height = itemHeight + 'px';
      task.style.width = '100%';
    });
    let visibleCount = Math.max(endIndex - startIndex, tasks.length);
    virtualContainer.style.height = (visibleCount * itemHeight) + 'px';
    if (typeof window !== 'undefined' && spacer instanceof HTMLElement) {
      let total = parseInt(virtualContainer.dataset.totalItems || '0', 10);
      spacer.style.height = (total * itemHeight) + 'px';
    }
  }
}

let bootstrapVirtualScroll = () => {
  let manager = new VirtualScrollManager();
  manager.init();
  window.VirtualScrollManager = VirtualScrollManager;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapVirtualScroll, { once: true });
} else {
  bootstrapVirtualScroll();
}
</script>`;

export let getVirtualScrollScript = (): string => VIRTUAL_SCROLL_SCRIPT;
