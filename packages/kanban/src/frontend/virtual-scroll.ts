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

export const VIRTUAL_SCROLL_ITEM_HEIGHT = 80;
export const VIRTUAL_SCROLL_VIEWPORT_HEIGHT = 600;
export const VIRTUAL_SCROLL_BUFFER = 5;
export const BOARD_VIRTUAL_SCROLL_THRESHOLD = 100;
export const COLUMN_VIRTUAL_SCROLL_THRESHOLD = 50;

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

const clampRange = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const computeVisibleRange = (
  totalItems: number,
  viewportHeight: number,
  itemHeight: number,
  bufferSize: number,
): Readonly<{ startIndex: number; endIndex: number }> => {
  if (!Number.isFinite(totalItems) || totalItems <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }
  const safeViewport = Math.max(viewportHeight, itemHeight);
  const baseVisible = Math.max(1, Math.ceil(safeViewport / Math.max(itemHeight, 1)));
  const buffered = clampRange(baseVisible + bufferSize * 2, baseVisible, totalItems);
  return {
    startIndex: 0,
    endIndex: buffered,
  };
};

const shouldVirtualizeBoard = (columns: ReadonlyArray<ReadonlyColumn>): boolean => {
  const totalItems = columns.reduce((acc, column) => acc + column.tasks.length, 0);
  if (totalItems > BOARD_VIRTUAL_SCROLL_THRESHOLD) {
    return true;
  }
  const heavyColumns = columns.filter((column) => column.tasks.length > COLUMN_VIRTUAL_SCROLL_THRESHOLD);
  return columns.length > 1 && totalItems >= BOARD_VIRTUAL_SCROLL_THRESHOLD && heavyColumns.length > 0;
};

export const planVirtualScroll = (columns: ReadonlyArray<ReadonlyColumn>): BoardVirtualizationPlan => {
  const boardVirtualized = shouldVirtualizeBoard(columns);
  const plans = new Map<string, ColumnVirtualizationPlan>();
  for (const column of columns) {
    const totalItems = column.tasks.length;
    const eligibleByColumn = totalItems >= BOARD_VIRTUAL_SCROLL_THRESHOLD;
    const enabled =
      totalItems > COLUMN_VIRTUAL_SCROLL_THRESHOLD && (boardVirtualized || eligibleByColumn);
    const { startIndex, endIndex } = computeVisibleRange(
      totalItems,
      VIRTUAL_SCROLL_VIEWPORT_HEIGHT,
      VIRTUAL_SCROLL_ITEM_HEIGHT,
      VIRTUAL_SCROLL_BUFFER,
    );
    const cappedEndIndex = Math.min(endIndex, totalItems);
    const normalizedStart = Math.min(startIndex, Math.max(totalItems - 1, 0));
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

const VIRTUAL_SCROLL_SCRIPT = String.raw`<script>
class VirtualScrollManager {
  constructor() {
    this.containers = Array.from(document.querySelectorAll('[data-role="virtual-scroll-container"]'));
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    if (!this.containers.length) return;
    this.containers.forEach((container) => {
      const viewport = container.querySelector('[data-role="virtual-scroll-viewport"]');
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
    const target = event && event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const container = target.closest('[data-role="virtual-scroll-container"]');
    if (!container) return;
    this.updateVisibleItems(container);
  }

  handleResize() {
    this.containers.forEach((container) => {
      this.updateVisibleItems(container);
    });
  }

  calculateVirtualScrollRange(container) {
    const virtualContainer = container.querySelector('[data-role="virtual-scroll-items"]');
    const viewport = container.querySelector('[data-role="virtual-scroll-viewport"]');
    if (!virtualContainer || !viewport) {
      return { startIndex: 0, endIndex: 0 };
    }
    const totalItems = parseInt(virtualContainer.dataset.totalItems || '0', 10);
    const itemHeight = parseInt(virtualContainer.dataset.itemHeight || '0', 10);
    const bufferSize = parseInt(virtualContainer.dataset.bufferSize || '0', 10);
    if (!totalItems || !itemHeight) {
      return { startIndex: 0, endIndex: 0 };
    }
    const scrollTop = viewport.scrollTop;
    const viewportHeight = viewport.clientHeight;
    const startIndex = Math.max(Math.floor(scrollTop / itemHeight) - bufferSize, 0);
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + bufferSize * 2;
    const endIndex = Math.min(totalItems, Math.max(startIndex + visibleCount, startIndex + 1));
    return { startIndex, endIndex };
  }

  updateVisibleItems(container) {
    const virtualContainer = container.querySelector('[data-role="virtual-scroll-items"]');
    const viewport = container.querySelector('[data-role="virtual-scroll-viewport"]');
    const spacer = container.querySelector('[data-role="virtual-scroll-spacer"]');
    if (!virtualContainer) return;
    if (!viewport || !spacer) return;
    const { startIndex, endIndex } = this.calculateVirtualScrollRange(container);
    virtualContainer.dataset.startIndex = String(startIndex);
    virtualContainer.dataset.endIndex = String(endIndex);
    const itemHeight = parseInt(virtualContainer.dataset.itemHeight || '0', 10);
    if (!itemHeight) return;
    const tasks = virtualContainer.querySelectorAll('[data-role="task-card"]');
    tasks.forEach((task, offset) => {
      if (!(task instanceof HTMLElement)) return;
      const index = startIndex + offset;
      task.style.position = 'absolute';
      task.style.top = (index * itemHeight) + 'px';
      task.style.height = itemHeight + 'px';
      task.style.width = '100%';
    });
    const visibleCount = Math.max(endIndex - startIndex, tasks.length);
    virtualContainer.style.height = (visibleCount * itemHeight) + 'px';
    if (typeof window !== 'undefined' && spacer instanceof HTMLElement) {
      const total = parseInt(virtualContainer.dataset.totalItems || '0', 10);
      spacer.style.height = (total * itemHeight) + 'px';
    }
  }
}

const bootstrapVirtualScroll = () => {
  const manager = new VirtualScrollManager();
  manager.init();
  window.VirtualScrollManager = VirtualScrollManager;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapVirtualScroll, { once: true });
} else {
  bootstrapVirtualScroll();
}
</script>`;

export const getVirtualScrollScript = (): string => VIRTUAL_SCROLL_SCRIPT;
