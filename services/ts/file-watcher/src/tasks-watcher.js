import chokidar from 'chokidar';
const EVENTS = {
    add: 'file-watcher-task-add',
    change: 'file-watcher-task-change',
};
export function createTasksWatcher({ tasksPath, publish }) {
    const watcher = chokidar.watch(tasksPath, { ignoreInitial: true });
    watcher.on('add', (path) => {
        publish(EVENTS.add, { path });
    });
    watcher.on('change', (path) => {
        publish(EVENTS.change, { path });
    });
    return watcher;
}
//# sourceMappingURL=tasks-watcher.js.map