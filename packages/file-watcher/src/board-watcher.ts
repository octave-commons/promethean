import chokidar from "chokidar";
const EVENT = "file-watcher-board-change";

export interface BoardWatcherOptions {
  boardPath: string;
  publish: (type: string, payload: any) => void;
}

export function createBoardWatcher({
  boardPath,
  publish,
}: BoardWatcherOptions) {
  const watcher = chokidar.watch(boardPath, { ignoreInitial: true });
  watcher.on("change", () => {
    publish(EVENT, { path: boardPath });
  });
  return watcher;
}
