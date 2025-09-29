declare module '@promethean/compiler/transform/transformer.js';
declare module '@promethean/dev/harness.js';
declare module '@promethean/fs/fileExplorer.js';
declare module '@promethean/markdown/kanban.js';
declare module '@promethean/markdown/sync.js';
declare module '@promethean/markdown/statuses.js' {
    export const STATUS_ORDER: readonly string[];
    export const STATUS_SET: ReadonlySet<string>;
    export function headerToStatus(header: string): string;
}
declare module '@promethean/markdown/task.js';
declare module '@promethean/parity/normalizers.js';
declare module '@promethean/parity/runner.js';
declare module '@promethean/stream/title.js';
declare module '@promethean/web-utils';
