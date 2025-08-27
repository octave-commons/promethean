import chokidar from 'chokidar';
export interface BoardWatcherOptions {
    boardPath: string;
    publish: (type: string, payload: any) => void;
}
export declare function createBoardWatcher({ boardPath, publish }: BoardWatcherOptions): chokidar.FSWatcher;
//# sourceMappingURL=board-watcher.d.ts.map