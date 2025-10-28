import { sep } from "path";

export class FileLocks {
  private locks = new Set<string>();

  isLocked(path: string): boolean {
    for (const locked of this.locks) {
      if (path === locked || path.startsWith(locked + sep)) {
        return true;
      }
    }
    return false;
  }

  lock(path: string): void {
    this.locks.add(path);
  }

  unlock(path: string): void {
    this.locks.delete(path);
  }

  unlockAfter(path: string, delay = 100): void {
    setTimeout(() => this.unlock(path), delay);
  }
}
