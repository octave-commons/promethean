import type { ExecutionContext } from "ava";
import type { Board, ColumnData, Task } from "../lib/types.js";
export declare const makeTask: (overrides: Partial<Task> & Pick<Task, "uuid" | "title" | "status">) => Task;
export declare const makeBoard: (columns: ColumnData[]) => Board;
export declare const withTempDir: (t: ExecutionContext) => Promise<string>;
export declare const writeTaskFile: (dir: string, task: Task, extra?: {
    content?: string;
    labels?: string[];
}) => Promise<string>;
export declare const getTaskFileByUuid: (dir: string, uuid: string) => Promise<{
    file: string;
    content: string;
} | undefined>;
export declare const snapshotTaskFiles: (dir: string) => Promise<Map<string, string>>;
//# sourceMappingURL=helpers.d.ts.map