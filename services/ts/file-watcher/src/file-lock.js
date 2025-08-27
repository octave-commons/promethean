import { sep } from 'path';
export class FileLocks {
    locks = new Set();
    isLocked(path) {
        for (const locked of this.locks) {
            if (path === locked || path.startsWith(locked + sep)) {
                return true;
            }
        }
        return false;
    }
    lock(path) {
        this.locks.add(path);
    }
    unlock(path) {
        this.locks.delete(path);
    }
    unlockAfter(path, delay = 100) {
        setTimeout(() => this.unlock(path), delay);
    }
}
//# sourceMappingURL=file-lock.js.map