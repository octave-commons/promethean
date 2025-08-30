export class TokenBucket {
    private capacity: number;
    private tokens: number;
    private refillPerSec: number;
    private last: number;

    constructor({ capacity, refillPerSec }: { capacity: number; refillPerSec: number }) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.refillPerSec = refillPerSec;
        this.last = Date.now();
    }

    private refill() {
        const now = Date.now();
        const delta = (now - this.last) / 1000;
        this.tokens = Math.min(this.capacity, this.tokens + delta * this.refillPerSec);
        this.last = now;
    }

    tryConsume(n = 1): boolean {
        this.refill();
        if (this.tokens >= n) {
            this.tokens -= n;
            return true;
        }
        return false;
    }

    deficit(n = 1): number {
        this.refill();
        return Math.max(0, n - this.tokens);
    }
}
