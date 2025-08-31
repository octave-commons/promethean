export const metrics = {
    sessions: 0,
    calls: 0,
};

export function trackSession(delta: number) {
    metrics.sessions += delta;
}

export function trackCall() {
    metrics.calls += 1;
}
