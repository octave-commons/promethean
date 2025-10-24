import { TokenBucket } from '@promethean-os/monitoring';

export function makeConnLimiter() {
    return new TokenBucket({ capacity: 200, refillPerSec: 200 }); // 200 msgs/sec burst
}

export function makeTopicLimiter(_topic: string) {
    return new TokenBucket({ capacity: 1000, refillPerSec: 1000 });
}
