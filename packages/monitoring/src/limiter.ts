export type TokenBucketOptions = Readonly<{
  capacity: number;
  refillPerSec: number;
  now?: () => number;
}>;

type BucketState = Readonly<{
  tokens: number;
  last: number;
}>;

const states = new WeakMap<TokenBucket, BucketState>();

export class TokenBucket {
  private readonly capacity: number;
  private readonly refillPerSec: number;
  private readonly now: () => number;

  constructor(options: TokenBucketOptions) {
    const { capacity, refillPerSec, now = Date.now } = options;
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
    this.now = now;
    states.set(this, { tokens: capacity, last: this.now() });
  }

  private getState(): BucketState {
    const state = states.get(this);
    if (state === undefined) {
      throw new Error("TokenBucket state missing");
    }
    return state;
  }

  private setState(state: BucketState): void {
    states.set(this, state);
  }

  private refill() {
    const current = this.now();
    const state = this.getState();
    const delta = Math.max(0, current - state.last) / 1000;
    const tokens = Math.min(
      this.capacity,
      state.tokens + delta * this.refillPerSec,
    );
    this.setState({ tokens, last: current });
  }

  tryConsume(n = 1): boolean {
    this.refill();
    const state = this.getState();
    if (state.tokens >= n) {
      this.setState({ tokens: state.tokens - n, last: state.last });
      return true;
    }
    return false;
  }

  deficit(n = 1): number {
    this.refill();
    const state = this.getState();
    return Math.max(0, n - state.tokens);
  }

  drain(): number {
    this.refill();
    const state = this.getState();
    this.setState({ tokens: 0, last: state.last });
    return state.tokens;
  }
}
