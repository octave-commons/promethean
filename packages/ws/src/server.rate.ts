// SPDX-License-Identifier: GPL-3.0-only
import { TokenBucket } from '@promethean/rate/limiter.js';

export function makeConnLimiter() {
    return new TokenBucket({ capacity: 200, refillPerSec: 200 }); // 200 msgs/sec burst
}

export function makeTopicLimiter(_topic: string) {
    return new TokenBucket({ capacity: 1000, refillPerSec: 1000 });
}
