import chokidar from 'chokidar';
const EVENT = 'file-watcher-board-change';
export function createBoardWatcher({ boardPath, publish }) {
    const watcher = chokidar.watch(boardPath, { ignoreInitial: true });
    watcher.on('change', () => {
        publish(EVENT, { path: boardPath });
    });
    return watcher;
}
//# sourceMappingURL=board-watcher.js.map